const express = require("express");
const cors= require("cors")
const Auth = require("../Middleware/AuthMiddleware");
const { Wish } = require("../db");



const app =express();
app.use(cors());
app.use(express.json())
require("dotenv").config()
const wishRouter = express.Router()


wishRouter.post("/addwish", Auth, async (req, res) => {
    const body = req.body;
    const userId = req.userId;

    // if (!body.title || !body.price || !body.category || !body.image || !body.productId) {
    //     return res.status(400).json({ msg: "Missing required fields" });
    // }

    try {
     
        const Check = await Wish.findOne({
            category: body.category,
            userId: userId
        });

        if (Check) {
            return res.status(403).json({ msg: "Item already in cart" });
        }

        const item = await Wish.create({
          
            price: body.price,
            category: body.category,
            image: body.image,
            userId: userId,
           
        });

        return res.json({ msg: "Item added to Wish", data: item });
   } catch (error) {
    return res.status(403).json({msg:"error while add Wish"})
   }
})


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

module.exports=wishRouter