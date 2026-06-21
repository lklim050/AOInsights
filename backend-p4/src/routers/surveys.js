import express from "express";
import {
  createSurvey,
  deleteSurvey,
  getSurveyById,
  readAllSurveys,
  readPublishedSurveys,
  readSurveysAdmin,
  toggleSurveyPublishAdmin,
  updateSurvey,
} from "../controllers/surveys.js";
import { auth, authAdmin, authHost } from "../middlewares/users.js";
import {
  getSurveyInsights,
  getSurveyResults,
} from "../controllers/responses.js";

const router = express.Router();

router.get("/admin", authAdmin, readSurveysAdmin);
router.get("/", auth, readAllSurveys);
router.get("/public", auth, readPublishedSurveys);
router.put("/", authHost, createSurvey);
router.patch("/:surveyId", authHost, updateSurvey);
router.delete("/:surveyId", authHost, deleteSurvey);
router.post("/:surveyId", auth, getSurveyById);
router.get("/:surveyId/results", authHost, getSurveyResults);
router.post("/:surveyId/insights", authHost, getSurveyInsights);
router.patch("/:surveyId/toggle", authAdmin, toggleSurveyPublishAdmin);

export default router;
