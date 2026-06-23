import express from "express";
import { auth } from "../middlewares/users.js";
import {
  getSurveyResponseByUser,
  postSurveyResponse,
  submitSurveyResponse,
} from "../controllers/responses.js";
import {
  validateResponseSubmission,
  validateSurveyIdParam,
} from "../validators/surveys.js";
import checkError from "../validators/checkErrors.js";

const router = express.Router();

router.put(
  "/submit",
  auth,
  validateResponseSubmission,
  checkError,
  submitSurveyResponse,
);
router.post(
  "/survey/:surveyId",
  auth,
  validateSurveyIdParam,
  checkError,
  postSurveyResponse,
);
router.get("/", auth, getSurveyResponseByUser);

export default router;
