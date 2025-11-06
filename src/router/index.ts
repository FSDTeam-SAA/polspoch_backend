import { Router } from "express";
import userRouter from "../modules/user/user.router";
import authRouter from "../modules/auth/auth.router";
import contactRouter from "../modules/contact/contact.router";
import productRouter from "../modules/product/product.router";
import serviceRouter from "../modules/service/service.router";

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
    route:productRouter,
  },
  {
    path: "/service",
    route:serviceRouter,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
