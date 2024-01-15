const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const formidable = require("express-formidable");
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  productPhoto,
  productFilter,
  totalCount,
  perPageProducts,
  searchProduct,
  categoryWiseProducts,
  braintreeTokenController,
  brainTreePaymentController,
} = require("../controllers/productController");

const router = express.Router();

router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProduct
);
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProduct
);
router.delete(
  "/delete-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  deleteProduct
);
router.get("/get-all-products", getAllProducts);
router.get("/get-single-product/:slug", getSingleProduct);
router.get("/get-product-photo/:pid", productPhoto);
router.post("/product-filter", productFilter);
router.get("/total-products", totalCount);
router.get("/perpage-products/:page", perPageProducts);
router.get("/search/:keyword", searchProduct);
router.get("/product-category-wise/:slug", categoryWiseProducts);
//payments routes
//token
router.get("/braintree/token", braintreeTokenController);

//payments
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

module.exports = router;
