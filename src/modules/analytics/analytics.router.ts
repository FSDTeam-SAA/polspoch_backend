import { Router } from "express";
import analyticController from "./analytics.controller";

const router = Router();

router.get("/data", analyticController.getAnalytics)
router.get("/chart-data", analyticController.getChartData)

const analyticRouter = router;
export default analyticRouter;
