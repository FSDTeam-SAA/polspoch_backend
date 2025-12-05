import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import paymentController from "./payment.controller";

const router = Router();

router.post("/pay", auth(USER_ROLE.USER), paymentController.createPayment);
router.get(
  "/my-payments",
  auth(USER_ROLE.USER),
  paymentController.getMyPayments
);

router.get(
  "/all-payments",
  auth(USER_ROLE.ADMIN),
  paymentController.getAllPayments
);

const paymentRouter = router;
export default paymentRouter;
