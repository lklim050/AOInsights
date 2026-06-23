import prisma from "../db/prisma.js";
import { processSurveyResults } from "../utils/resultProcessor.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const hostVerification = async (surveyId, hostId) => {
  // Check survey ownership
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
  });

  if (!survey) return { error: 404, msg: "Survey not found" };
  if (survey.created_by !== hostId) {
    return { error: 403, msg: "You do not own this survey" };
  }
  return { success: true, survey };
};

export const getSurveyResponseByUser = async (req, res) => {
  try {
    const userId = req.decoded?.id || req.decoded?.uuid;
    if (!userId) {
      return res.status(401).json({ status: "error", msg: "User not found" });
    }

    const responses = await prisma.surveyResponse.findMany({
      where: {
        user_id: userId,
      },
    });

    res.status(201).json({
      status: "ok",
      msg: "Responses fetched successfully",
      responses_count: responses.length,
      responses: responses,
    });
  } catch (error) {
    console.error("❌ getSurveyResponse error:", error);
    return res
      .status(500)
      .json({ status: "error", msg: "failed to fetch responses" });
  }
};

export const postSurveyResponse = async (req, res) => {
  try {
    const surveyId = Number(req.params.surveyId);
    const userId = req.decoded?.id || req.decoded?.uuid;
    if (!userId) {
      return res
        .status(401)
        .json({ status: "error", msg: "User not found or login" });
    }
    const surveyData = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { id: "asc" },
        },
        responses: {
          where: { user_id: userId },
        },
      },
    });

    if (!surveyData) return res.status(404).json({ msg: "Survey not found" });
    const myResponse = surveyData.responses[0] || null;

    return res.status(201).json({
      status: "ok",
      msg: `Survey ID ${surveyId} fetched successfully`,
      survey: {
        id: surveyData.id,
        title: surveyData.title,
        questions: surveyData.questions,
        survey_response: myResponse, // This will contain their submitted answers
      },
    });
  } catch (error) {
    console.error("❌ postSurveyResponse Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to submit survey response" });
  }
};

export const submitSurveyResponse = async (req, res) => {
  try {
    const { survey_id, answers_payload } = req.body;
    const userId = req.decoded?.id || req.decoded?.uuid;

    if (!userId) {
      return res
        .status(401)
        .json({ status: "error", msg: "User not found or login" });
    }

    // Target Survey Checks
    const survey = await prisma.survey.findUnique({
      where: { id: Number(survey_id) },
    });

    if (!survey) {
      return res.status(404).json({ status: "error", msg: "Survey not found" });
    }

    if (!survey.is_published) {
      return res.status(400).json({
        status: "error",
        msg: "Cannot submit responses to an unpublished survey",
      });
    }

    // Double Submission Guard Check
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: {
        user_id_survey_id: {
          user_id: userId,
          survey_id: Number(survey_id),
        },
      },
    });

    if (existingResponse) {
      return res.status(400).json({
        status: "error",
        msg: "You have already completed this survey and claimed your points!",
      });
    }

    // Create and update starts here after previous checks pass
    const result = await prisma.$transaction(async (tx) => {
      // Store the response payload structure
      const newResponse = await tx.surveyResponse.create({
        data: {
          user_id: userId,
          survey_id: Number(survey_id),
          answers_payload: answers_payload, // Directly injects the JSON array package
          status: "completed", // Overriding default "pending" since submission is successful
        },
      });

      // Increment the commuter's points balance automatically
      const updatedUser = await tx.user.update({
        where: { uuid: userId },
        data: {
          points_bal: {
            increment: survey.points_reward,
          },
        },
      });

      return { newResponse, newBalance: updatedUser.points_bal };
    });

    return res.status(201).json({
      status: "ok",
      msg: "Survey submitted successfully! Points credited.",
      reward_points: survey.points_reward,
      new_total_balance: result.newBalance,
      response_id: result.newResponse.id,
      show: existingResponse,
    });
  } catch (error) {
    console.error("❌ submitSurveyResponse Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to submit survey response" });
  }
};

export const getSurveyResults = async (req, res) => {
  try {
    const surveyId = Number(req.params.surveyId);
    const hostId = req.decoded?.id || req.decoded?.uuid;

    const hostVerify = await hostVerification(surveyId, hostId);
    if (hostVerify.error) {
      return res
        .status(hostVerify.error)
        .json({ status: "error", msg: hostVerify.msg });
    }

    // Get all questions relating to the target survey by id
    const questions = await prisma.question.findMany({
      where: { survey_id: surveyId },
      orderBy: { id: "asc" },
    });

    // Get all responses relating to the target survey by id
    const responses = await prisma.surveyResponse.findMany({
      where: { survey_id: surveyId },
    });

    // After all checks done, processing of resutls start here

    const { totalSubmissions, resultsSummary } = processSurveyResults(
      questions,
      responses,
    );

    // Return the processed aggregated results here
    return res.json({
      status: "ok",
      survey_title: hostVerify.survey?.title,
      total_submissions: totalSubmissions,
      results: resultsSummary,
    });
  } catch (error) {
    console.error("❌ getSurveyResults Error:", error.message);
    return res
      .status(500)
      .json({ status: "error", msg: "Fail to compile survey results" });
  }
};

export const getSurveyInsights = async (req, res) => {
  try {
    const surveyId = Number(req.params.surveyId);
    const hostId = req.decoded?.id || req.decoded?.uuid;

    const hostVerify = await hostVerification(surveyId, hostId);
    if (hostVerify.error) {
      return res
        .status(hostVerify.error)
        .json({ status: "error", msg: hostVerify.msg });
    }

    // Get all questions relating to the target survey by id
    const questions = await prisma.question.findMany({
      where: { survey_id: surveyId },
      orderBy: { id: "asc" },
    });

    // Get all responses relating to the target survey by id
    const responses = await prisma.surveyResponse.findMany({
      where: { survey_id: surveyId },
    });

    // Process results with help of processSurveyResults function
    const { totalSubmissions, resultsSummary } = processSurveyResults(
      questions,
      responses,
    );

    const existingInsight = await prisma.surveyInsight.findUnique({
      where: { survey_id: surveyId },
    });

    const lastCount = existingInsight ? existingInsight.submission_count : 0;
    const aiModel = "gemini-3.1-flash-lite";
    const getInsight = !existingInsight || totalSubmissions > lastCount + 5;

    if (totalSubmissions < 5)
      return res.status(200).json({
        status: "ok",
        msg: `Will Not Generate Insight as responses is less than 5 (Received: ${totalSubmissions})`,
        aiModel: "Looking for AI...",
        insights: existingInsight || [],
        last_created_at: "",
      });

    if (!getInsight)
      return res.status(200).json({
        status: "ok",
        msg: "Fetch previous Insight, will refresh when there are more responses received",
        aiModel: aiModel,
        insights: existingInsight,
        last_created_at: existingInsight.createdAt,
      });

    // AI Generation starts here if no existing insights
    const prompt = `
      You are a data analyst. Analyze the survey results in the JSON below.

      Return your analysis in this markdown format:

      ### 1. Trends Analysis
      * **[Trend Label]:** [Your analysis]. **(SENTIMENT)**
      (Add 2-4 bullets based on what the data actually shows)

      ### 2. Summary of Text Feedback
      * **[Feedback Label]:** [Your summary]. **(SENTIMENT)**
      (Add 2-4 bullets based on what the data actually shows)

      ### 3. Actionable Recommendations
      * **[Recommendation Label]:** [Your recommendation]. **(PRIORITY)**
      (Add exactly 3 bullets)

      KEYWORD RULES:
      - Replace (SENTIMENT) with POSITIVE, NEGATIVE, or NEUTRAL based on the ACTUAL data
      - Replace (PRIORITY) with HIGH, MEDIUM, or LOW for recommendations
      - Be honest: if the data is neutral or inconclusive, mark it NEUTRAL
      - Do NOT force a mix of sentiments — if all feedback is neutral, mark everything NEUTRAL
      - If there is limited or test data, NEUTRAL is the appropriate sentiment

      FORMAT RULES:
      - Every bullet MUST end with **(KEYWORD)**
      - Use ONLY: POSITIVE, NEGATIVE, NEUTRAL for sentiment
      - Use ONLY: HIGH, MEDIUM, LOW for priority
      - Do NOT use markdown tables
      - Do NOT put the keyword inside the label
      - Use the exact section headers shown (### with number and title)

      JSON: ${JSON.stringify(resultsSummary)}
    `;

    const result = await ai.models.generateContent({
      model: aiModel, // Alternative to try
      contents: prompt,
    });

    const insight = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    const newAiModel = result?.modelVersion;

    if (!insight) {
      throw new Error("AI returned an empty response");
    }

    const updatedInsight = await prisma.surveyInsight.upsert({
      where: { survey_id: surveyId },
      update: {
        summary: insight,
        submission_count: totalSubmissions,
      },
      create: {
        survey_id: surveyId,
        summary: insight,
        submission_count: totalSubmissions,
      },
    });

    return res.status(200).json({
      status: "ok",
      msg: `Fetch data successfully using AI model ${newAiModel}`,
      aiModel: newAiModel,
      insights: updatedInsight,
      last_created_at: updatedInsight.createdAt,
    });
  } catch (error) {
    console.error("❌ getSurveyInsights Error:", error.message);
    res
      .status(500)
      .json({ status: "error", msg: "Fail to generate insights with AI" });
  }
};
