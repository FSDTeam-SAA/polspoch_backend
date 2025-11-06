import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import productController from "./product.controller";

const router = Router();

router.post(
  "/add-product",
  upload.array("images", 10),
  productController.addNewProduct
);

router.get("/all-products", productController.getAllProducts);
router.get("/:productId", productController.getSingeProduct);

router.put(
  "/update-product/:productId",
  upload.array("images", 10),
  productController.updateProduct
);

router.delete("/delete-product/:productId", productController.deleteProduct);

const productRouter = router;
export default productRouter;
