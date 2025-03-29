import express from "express"
const router=express.Router();
import { signUp,login, logout, checkIsLoggedIn } from "../controllers/authController.js";

router.post("/signUp",signUp);
router.post("/login",login);
router.get('/checkToken',checkIsLoggedIn)
router.delete("/logout",logout)

export default router;