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

const productRouter = router;
export default productRouter;
