import { NextFunction, Request, Response, Router } from "express";
import authController from "./auth.controller";
import validateRequest from "../../middleware/validateRequest";
import { authValidationSchema } from "./auth.validation";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import passport from "passport";

const router = Router();

router.post(
  "/login",
  validateRequest(authValidationSchema.authValidation),
  authController.login
);

router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);

router.post(
  "/resend-forgot-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  authController.resendForgotOtpCode
);

router.post(
  "/verify-otp",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  authController.verifyOtp
);

router.post(
  "/reset-password",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  authController.resetPassword
);

router.post(
  "/change-password",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  authController.changePassword
);

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = (req.query.redirect as string) || "/";

    passport.authenticate("google", {
      scope: ["email", "profile"],
      state: redirect,
    })(req, res, next);
  },
);


router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.googleCallback,
);

const authRouter = router;
export default authRouter;
