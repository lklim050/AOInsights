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
import {
  validateSurveyCreation,
  validateSurveyIdParam,
} from "../validators/surveys.js";
import checkError from "../validators/checkErrors.js";

const router = express.Router();

router.get("/admin", authAdmin, readSurveysAdmin);
router.get("/", auth, readAllSurveys);
router.get("/public", auth, readPublishedSurveys);
router.put("/", authHost, validateSurveyCreation, checkError, createSurvey);
router.patch(
  "/:surveyId",
  authHost,
  validateSurveyIdParam,
  checkError,
  updateSurvey,
);
router.delete(
  "/:surveyId",
  authHost,
  validateSurveyIdParam,
  checkError,
  deleteSurvey,
);
router.post(
  "/:surveyId",
  auth,
  validateSurveyIdParam,
  checkError,
  getSurveyById,
);
router.get(
  "/:surveyId/results",
  authHost,
  validateSurveyIdParam,
  checkError,
  getSurveyResults,
);
router.post(
  "/:surveyId/insights",
  authHost,
  validateSurveyIdParam,
  checkError,
  getSurveyInsights,
);
router.patch(
  "/:surveyId/toggle",
  authAdmin,
  validateSurveyIdParam,
  checkError,
  toggleSurveyPublishAdmin,
);

export default router;
