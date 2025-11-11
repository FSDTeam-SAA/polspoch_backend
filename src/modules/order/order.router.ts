import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import orderController from "./order.controller";

const router = Router();

router.post("/create-order", auth(USER_ROLE.USER), orderController.createOrder);

const orderRouter = router;
export default orderRouter;
