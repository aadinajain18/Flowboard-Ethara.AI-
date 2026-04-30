import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { signupSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, try later" },
});

router.post("/signup", authLimiter, validate(signupSchema), AuthController.signup);
router.post("/login", authLimiter, validate(loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.me);

export default router;
