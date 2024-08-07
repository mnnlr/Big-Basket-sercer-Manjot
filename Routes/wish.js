const express = require("express");
const cors= require("cors")
const Auth = require("../Middleware/AuthMiddleware");
const { Wish, User } = require("../db");



const app =express();
app.use(cors());
app.use(express.json())
require("dotenv").config()
const wishRouter = express.Router()


wishRouter.post("/addwish", Auth, async (req, res) => {
    const { price, category, image, productId,discountprice } = req.body;
    const userId = req.userId;


    // console.log('Received data:', { price,discountprice, category, image, productId });
    // console.log('User ID:', userId);

    if (!price || !discountprice || !category || !image || !productId) {
        return res.status(400).json({ msg: "Missing required fields", fields: { price, category, image, productId,discountprice } });
    }

    try {
     
        const existingItem = await Wish.findOne({
            productId: productId,
            userId: userId
        });

        if (existingItem) {
            return res.status(403).json({ msg: "Item already in wishlist" });
        }

     
        const newItem = await Wish.create({
            price,
            discountprice,
            category,
            image,
            userId,
            productId
        });

        return res.status(201).json({ msg: "Item added to wishlist", data: newItem });
    } catch (error) {
        console.error("Error while adding to wishlist:", error);
        return res.status(500).json({ msg: "Error while adding item to wishlist" });
    }
});







wishRouter.get("/Wish", Auth, async (req, res) => {
    const userId = req.userId;
    try {
        const items = await Wish.find({ userId: userId });
        if (!items) {
            return res.status(404).json({ message: "No items found." });
        }
        res.json({ items });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Server error" });
    }
}); 



wishRouter.post("/removeWishlist", Auth, async (req, res) => {
    const { productId } = req.body;
    const userId = req.userId;
  
    if (!productId) {
      return res.status(400).json({ msg: "Product ID is required" });
    }
  
    try {
      const result = await Wish.findOneAndDelete({ productId, userId });
      if (result) {
        return res.status(200).json({ msg: "Item removed from wishlist" });
      } else {
        return res.status(404).json({ msg: "Item not found in wishlist" });
      }
    } catch (error) {
      console.error("Error removing item from wishlist:", error);
      return res.status(500).json({ msg: "Error removing item from wishlist" });
    }
  });


  wishRouter.get('/checkStatus/:productId', Auth, async (req, res) => {
    try {
      const productId = req.params.productId;
      const userId = req.userId; 
  
      const wishListItem = await Wish.findOne({ userId, productId });
  
      if (wishListItem) {
        res.json({ isLiked: true });
      } else {
        res.json({ isLiked: false });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  wishRouter.get('/count',Auth, async (req, res) => {
    try {
      const userId  = req.userId ; 
      const count = await Wish.countDocuments({ userId  });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });


module.exports=wishRouter