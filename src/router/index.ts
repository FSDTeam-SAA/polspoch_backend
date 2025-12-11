import { Router } from "express";
import authRouter from "../modules/auth/auth.router";
import cartRouter from "../modules/cart/cart.router";
import contactRouter from "../modules/contact/contact.router";
import orderRouter from "../modules/order/order.router";
import paymentRouter from "../modules/payment/payment.router";
import productRouter from "../modules/product/product.router";
import serviceRouter from "../modules/service/service.router";
import userRouter from "../modules/user/user.router";
import analyticRouter from "../modules/analytics/analytics.router";

const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/contact",
    route: contactRouter,
  },
  {
    path: "/product",
    route: productRouter,
  },
  {
    path: "/service",
    route: serviceRouter,
  },
  {
    path: "/cart",
    route: cartRouter,
  },
  {
    path: "/order",
    route: orderRouter,
  },
  {
    path: "/payment",
    route: paymentRouter,
  },
  {
    path: "/analytics",
    route: analyticRouter
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
