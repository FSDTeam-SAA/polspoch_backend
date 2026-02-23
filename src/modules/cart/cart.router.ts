import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import cartController from "./cart.controller";

const router = Router();

router.post("/add-cart", auth(), cartController.addToCart);
router.get("/my-cart", auth(), cartController.getMyCart);

router.put(
  "/increase-quantity/:cartId",
  auth(),
  cartController.increaseQuantity
);

router.post(
  "/merge-cart",
  auth(USER_ROLE.USER),
  cartController.mergeCart
);

router.delete(
  "/delete-cart/:cartId",
  auth(),
  cartController.deletedCart
);

const cartRouter = router;
export default cartRouter;
