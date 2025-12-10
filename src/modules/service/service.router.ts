import { Router } from "express";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";
import { createService, getMyServices } from "./service.controller";

const router = Router();

router.post("/create-service", auth(USER_ROLE.USER), createService);

router.get("/my-services", auth(USER_ROLE.USER), getMyServices);

const serviceRouter = router;
export default serviceRouter;
