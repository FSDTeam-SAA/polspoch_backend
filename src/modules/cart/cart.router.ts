import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import cartController from "./cart.controller";

const router = Router();

router.post("/add-cart", auth(USER_ROLE.USER), cartController.addToCart);
router.get("/my-cart", auth(USER_ROLE.USER), cartController.getMyCart);

router.delete(
  "/delete-cart/:cartId",
  auth(USER_ROLE.USER),
  cartController.deletedCart
);

const cartRouter = router;
export default cartRouter;
