import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import orderController from "./order.controller";

const router = Router();

router.post("/create-order", auth(USER_ROLE.USER), orderController.createOrder);

router.get("/my-orders", auth(USER_ROLE.USER), orderController.getMyOrders);
router.get("/all-orders", orderController.getAllOrders);

const orderRouter = router;
export default orderRouter;
