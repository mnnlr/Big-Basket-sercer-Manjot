const express = require("express");
const cors= require("cors")
const Auth = require("../Middleware/AuthMiddleware");
const { Cart } = require("../db");


const app =express();
app.use(cors());
app.use(express.json())
require("dotenv").config()
const cartRouter = express.Router()


cartRouter.post("/addcart", Auth, async (req, res) => {
    const body = req.body;
    const userId = req.userId;

    // if (!body.title || !body.price || !body.category || !body.image || !body.productId) {
    //     return res.status(400).json({ msg: "Missing required fields" });
    // }

    try {
     
        const Check = await Cart.findOne({
            title: body.title,
            userId: userId
        });

        if (Check) {
            return res.status(403).json({ msg: "Item already in cart" });
        }

        const item = await Cart.create({
            title: body.title,
            price: body.price,
            category: body.category,
            image: body.image,
            userId: userId,
            productId: body.productId
        });

        return res.json({ msg: "Item added to cart", data: item });
   } catch (error) {
    return res.status(403).json({msg:"error while add cart"})
   }
})


cartRouter.get("/cart", Auth, async (req, res) => {
    const userId = req.userId;
    try {
        const items = await Cart.find({ userId: userId });
        if (!items) {
            return res.status(404).json({ message: "No items found." });
        }
        res.json({ items });
    } catch (error) {
        console.error("Error fetching cart items:", error);
        res.status(500).json({ message: "Server error" });
    }
}); 

module.exports=cartRouter