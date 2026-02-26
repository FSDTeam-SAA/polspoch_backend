import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import orderShippingPolicyController from "./orderShippingPolicy.controller";

const router = Router();

router.post(
  "/create",
  auth(USER_ROLE.ADMIN),
  orderShippingPolicyController.createOrderShippingPolicy,
);
router.get("/", orderShippingPolicyController.getOrderShippingPolicy);
router.put(
  "/update/:id",
  auth(USER_ROLE.ADMIN),
  orderShippingPolicyController.updateOrderShippingPolicy,
);
router.delete(
  "/delete/:id",
  orderShippingPolicyController.deleteOrderShippingPolicy,
);

const orderShippingPolicyRouter = router;
export default orderShippingPolicyRouter;
