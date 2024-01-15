const slugify = require("slugify");
const fs = require("fs");
const productmodel = require("../models/productmodel");
const categorymodel = require("../models/categorymodel");
const braintree = require("braintree");
const orderModel = require("../models/orderModel");

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, shipping } = req.fields;
    const { photo } = req.files;
    if (!name || !description || !price || !quantity || !photo || !shipping) {
      res.status(200).send("All fields are required");
    }

    const product = new productmodel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, shipping } = req.fields;
    const { photo } = req.files;
    if (!name || !description || !price || !quantity || !photo || !shipping) {
      res.status(200).send("All fields are required");
    }

    const product = await productmodel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    res.status(201).send({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updating product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await productmodel.findByIdAndDelete(req.params.pid);

    res.status(201).send({
      success: true,
      message: "Product deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Deleting product",
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const product = await productmodel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.status(201).send({
      success: true,
      message: "Single Product",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Getting single product",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productmodel
      .find({})
      .select("-photo")
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(201).send({
      success: true,
      total_count: products.length,
      message: "All Products",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Getting All product",
    });
  }
};

const productPhoto = async (req, res) => {
  try {
    const product = await productmodel.findById(req.params.pid).select("photo");
    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting photo",
      error,
    });
  }
};

const productFilter = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productmodel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

const totalCount = async (req, res) => {
  try {
    const total = await productmodel.find().estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
  }
};

const perPageProducts = async (req, res) => {
  try {
    const { page } = req.params.page ? req.params.page : 1;
    const perPage = 2;
    const products = await productmodel
      .find({})
      .select("-photo")
      .limit(perPage)
      .skip((page - 1) * perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

const searchProduct = async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await productmodel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    res.json(products);
  } catch (e) {
    console.log(e);
  }
};

const categoryWiseProducts = async (req, res) => {
  try {
    const category = await categorymodel.find({ slug: req.params.slug });
    const products = await productmodel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });

    res.json(products);
  } catch (e) {
    console.log(e);
  }
};

//payment gateway api
//token
const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports.createProduct = createProduct;
module.exports.updateProduct = updateProduct;
module.exports.deleteProduct = deleteProduct;
module.exports.getAllProducts = getAllProducts;
module.exports.getSingleProduct = getSingleProduct;
module.exports.productPhoto = productPhoto;
module.exports.productFilter = productFilter;
module.exports.totalCount = totalCount;
module.exports.perPageProducts = perPageProducts;
module.exports.searchProduct = searchProduct;
module.exports.categoryWiseProducts = categoryWiseProducts;
module.exports.braintreeTokenController = braintreeTokenController;
module.exports.brainTreePaymentController = brainTreePaymentController;
