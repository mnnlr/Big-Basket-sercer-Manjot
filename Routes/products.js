const express = require("express");
const multer = require("multer");
const { ref,uploadBytesResumable,getDownloadURL} = require("firebase/storage");
const {auth, storage,Product} = require("../db");
const Auth = require("../Middleware/AuthMiddleware");
require("dotenv").config();

const ProductRouter = express.Router();


const upload = multer({ storage: multer.memoryStorage() });
const multiple = [Auth, upload.single("filename")];

ProductRouter.post("/addProduct", multiple, async (req, res) => {
  const body = req.body;
  if (!req.file) {
    console.log("file not uploaded");
  }



  try {
    const storageRef = ref(storage, `${req.file.originalname}`);
    const metadata = {
      contentType: req.file.mimetype
    };
  
    const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);

      const product = await Product.create({
      category: body.category,
      price: body.price,
      discountprice:body.discountprice,
      image: downloadURL,
    });

    // return res.json({ msg: "upload successfully" })
    return res.json({
      msg: "upload successfully",
      name: req.file.originalname,
      downloadURL: downloadURL,
      data: product._id.toHexString()
  })
  
    
  } catch (error) {
    console.error("Firebase Storage Error:", error.code, error.message);
    return res.status(403).json({ msg: "Error uploading file" });
  }
  
});




module.exports = ProductRouter;




