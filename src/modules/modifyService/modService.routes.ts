import { Router } from "express";
import { SteelConfigController } from "../modifyService/modService.controller";


const router = Router();

router.get("/config", SteelConfigController.getConfig);
router.put("/config/update", SteelConfigController.updateConfig); // Protect this with Admin Auth

export default router;