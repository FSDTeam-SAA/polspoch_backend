import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import { FamilyController, ProductController } from "./product.controller";

const router = Router();

router.post(
  "/add-product",
  upload.array("productImage", 10),
  ProductController.createProduct,
);

router.put(
  "/multiple-update",
  upload.single("file"),
  ProductController.multipleProductUpdate,
);

router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getSingleProduct);

router.put(
  "/update/:id",
  upload.array("productImage", 10),
  ProductController.updateProduct,
);

router.delete("/:id", ProductController.deleteProduct);

router.post(
  "/family/create",
  upload.single("img"),
  FamilyController.createFamily,
);

router.get("/family/all", FamilyController.getAllFamilies);
router.get("/family/:id", FamilyController.getSingleFamily);

router.put("/family/:id", upload.single("img"), FamilyController.updateFamily);

router.delete("/family/:id", FamilyController.deleteFamily);

export default router;
