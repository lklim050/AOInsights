import express from "express";
import { auth } from "../middlewares/users.js";
import {
  getSurveyResponseByUser,
  postSurveyResponse,
  submitSurveyResponse,
} from "../controllers/responses.js";

const router = express.Router();

router.put("/submit", auth, submitSurveyResponse);
router.post("/survey/:surveyId", auth, postSurveyResponse);
router.get("/", auth, getSurveyResponseByUser);

export default router;
