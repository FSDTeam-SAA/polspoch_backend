import { Router } from "express";
import { createService } from "./service.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../user/user.constant";


const router = Router();


router.post("/create-service", auth(USER_ROLE.USER),createService)

// router.get("/all-services", serviceController.getAllServices);
// router.get("/:serviceId", serviceController.getSingleService);

// router.put(
//   "/update-service/:serviceId",
//   upload.fields([
//     { name: "images", maxCount: 5 },
//     { name: "technicalImages", maxCount: 5 },
//   ]),
//   serviceController.updateService
// );

const serviceRouter = router;
export default serviceRouter;
