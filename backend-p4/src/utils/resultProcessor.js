// This function takes the raw data and returns the processed object
export const processSurveyResults = (questions, responses) => {
  const totalSubmissions = responses.length;
  const resultsSummary = {};

  // Initialize structure
  questions.forEach((q) => {
    if (q.type === "TEXT") {
      resultsSummary[q.id] = {
        question_text: q.question_text,
        type: q.type,
        text_responses: [],
      };
    } else {
      const optionCounts = {};
      if (Array.isArray(q.options)) {
        q.options.forEach((opt) => {
          optionCounts[opt] = 0;
        });
      }
      resultsSummary[q.id] = {
        question_text: q.question_text,
        type: q.type,
        counts: optionCounts,
        total_selections_counted: 0,
      };
    }
  });

  // Aggregate values
  responses.forEach((resp) => {
    const payload = resp.answers_payload;
    if (!Array.isArray(payload)) return;

    payload.forEach(({ question_id, answer }) => {
      const targetQuestion = resultsSummary[question_id];
      if (!targetQuestion) return;

      if (targetQuestion.type === "TEXT") {
        if (answer && typeof answer === "string" && answer.trim() !== "") {
          targetQuestion.text_responses.push(answer.trim());
        }
      } else {
        const choices = Array.isArray(answer) ? answer : [answer];
        choices.forEach((choice) => {
          if (
            choice !== null &&
            choice !== undefined &&
            targetQuestion.counts[choice] !== undefined
          ) {
            targetQuestion.counts[choice] += 1;
            targetQuestion.total_selections_counted += 1;
          }
        });
      }
    });
  });

  return { totalSubmissions, resultsSummary };
};
