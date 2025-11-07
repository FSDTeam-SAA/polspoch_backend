import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import serviceController from "./service.controller";

const router = Router();

router.post(
  "/create-service",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "technicalImages", maxCount: 5 },
  ]),
  serviceController.createNewService
);

const serviceRouter = router;
export default serviceRouter;
