import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import orderController from "./order.controller";

const router = Router();

router.post("/create-order", auth(USER_ROLE.USER), orderController.createOrder);

router.get("/my-orders", auth(USER_ROLE.USER), orderController.getMyOrders);
router.get("/all-orders", orderController.getAllOrders);

router.put(
  "/update-status/:orderId",
//   auth(USER_ROLE.ADMIN),
  orderController.updateOrderStatus
);

router.delete('/delete',orderController.deleteOrders)
const orderRouter = router;
export default orderRouter;
