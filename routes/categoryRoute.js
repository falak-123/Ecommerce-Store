

const express = require("express");
const { createCategory, updateCategory, deleteCategory, allCategory, singleCategory } = require("../controllers/categoryController");
const { isAdmin, requireSignIn } = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/create-category",requireSignIn,isAdmin,createCategory)
router.put("/update-category/:id",requireSignIn,isAdmin,updateCategory)
router.delete("/delete-category/:id",requireSignIn,isAdmin,deleteCategory)
router.get("/get-categories",allCategory)
router.get("/get-single-category/:slug",singleCategory)


module.exports = router