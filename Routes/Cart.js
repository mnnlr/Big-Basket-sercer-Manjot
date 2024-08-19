const express = require("express");
const cors = require("cors")
const Auth = require("../Middleware/AuthMiddleware");
const { Cart, Order } = require("../db");


const app = express();
app.use(cors());
app.use(express.json())
require("dotenv").config()
const cartRouter = express.Router()


// cartRouter.post("/addcart", Auth, async (req, res) => {
//   const { price, category, image, productId, discountprice } = req.body;
//   const userId = req.userId;
//   // console.log('Received data:', { price,discountprice, category, image, productId });
//   // console.log('User ID:', userId);

//   if (!price || !discountprice || !category || !image || !productId) {
//     return res.status(400).json({ msg: "Missing required fields", fields: { price, category, image, productId, discountprice } });
//   }
//   try {
//     const existingItem = await Cart.findOne({
//       productId: productId,
//       userId: userId
//     });
//     if (existingItem) {
//       return res.status(403).json({ msg: "Item already in wishlist" });
//     }
//     const newItem = await Cart.create({
//       price,
//       discountprice,
//       category,
//       image,
//       userId,
//       productId
//     });

//     return res.status(201).json({ msg: "Item added to wishlist", data: newItem });
//   } catch (error) {
//     console.error("Error while adding to wishlist:", error);
//     return res.status(500).json({ msg: "Error while adding item to wishlist" });
//   }
// });

cartRouter.post("/addcart", Auth, async (req, res) => {
  const { price, category, image, productId, quantity, discountprice } = req.body;
  const userId = req.userId;

  if (!price || !quantity || !category || !image || !productId) {
    return res.status(400).json({
      msg: "Missing required fields",
      fields: { price, quantity, category, image, productId, discountprice }
    });
  }

  if (quantity < 1) {
    return res.status(400).json({ msg: "Quantity must be at least 1" });
  }

  try {
    const existingItem = await Cart.findOne({
      productId: productId,
      userId: userId
    });

    if (existingItem) {
      return res.status(403).json({ msg: "Item already in cart" });
    }

    const newItem = await Cart.create({
      price,
      discountprice,
      category,
      image,
      userId,
      productId,
      quantity
    });
  

    return res.status(201).json({ msg: "Item added to cart", data: newItem });
  } catch (error) {
    console.error("Error while adding to cart:", error);
    return res.status(500).json({ msg: "Error while adding item to cart" });
  }
});





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

cartRouter.post("/removeCart", Auth, async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;

  if (!productId) {
    return res.status(400).json({ msg: "Product ID is required" });
  }

  try {
    const result = await Cart.findOneAndDelete({ productId, userId });
    if (result) {
      return res.status(200).json({ msg: "Item removed from Cart" });
    } else {
      return res.status(404).json({ msg: "Item not found in Cart" });
    }
  } catch (error) {
    console.error("Error removing item from wishlist:", error);
    return res.status(500).json({ msg: "Error removing item from Cart" });
  }
});

cartRouter.get('/count', Auth, async (req, res) => {
  try {
    const userId = req.userId;
    const count = await Cart.countDocuments({ userId });
    res.json({ count });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



cartRouter.put('/addqunatity', Auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const cartItem = await Cart.findOne({ productId, userId });
    if (!cartItem) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ msg: 'Quantity updated successfully', item: cartItem });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// cartRouter.post("/order", Auth,async(req,res)=>{
//     const body = req.body;
//     // console.log(body)
//     try{
//         const response = await Order.create({orders: body})
//         return res.json({msg: "Order Done"})
//     }
//     catch(error){
//         console.log(error)
//         return res.status(403).json({
//             msg: "error while adding to cart" 
//         })
//     } 
// })


cartRouter.post("/order", Auth, async (req, res) => {
  const { name, email, address, phone, orders } = req.body;

  
  console.log("Received order data:", req.body);

  try {
    const response = await Order.create({
      name,
      email,
      address,
      phone,
      orders
    });
    console.log("Order saved:", response);

    return res.json({ msg: "Order Done", order: response });
  } catch (error) {
    
    console.error("Error saving order:", error);
    return res.status(403).json({
      msg: "Error while adding order",
      error: error.message 
    });
  }
});




module.exports = cartRouter