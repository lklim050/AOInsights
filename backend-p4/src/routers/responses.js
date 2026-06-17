import express from "express";
import { auth } from "../middlewares/users.js";
import {
  postSurveyResponse,
  submitSurveyResponse,
} from "../controllers/responses.js";

const router = express.Router();

router.put("/submit", auth, submitSurveyResponse);
router.post("/survey/:surveyId", auth, postSurveyResponse);

export default router;
