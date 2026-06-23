import express from "express";
import {
  getAllUsers,
  loginUser,
  logoutUser,
  refreshAccess,
  registerUser,
} from "../controllers/users.js";
import { auth, authAdmin } from "../middlewares/users.js";
import {
  validateLoginData,
  validateRegistrationData,
} from "../validators/auth.js";
import checkError from "../validators/checkErrors.js";

const router = express.Router();

router.get("/", authAdmin, getAllUsers);
router.put("/register", validateRegistrationData, checkError, registerUser);
router.post("/login", validateLoginData, checkError, loginUser);
router.post("/refresh", refreshAccess);
router.post("/logout", logoutUser);

export default router;
