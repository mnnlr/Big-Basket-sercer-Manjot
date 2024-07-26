const express = require("express");
const zod= require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
const {  User } = require("../db");

require("dotenv").config();
const app = express();
app.use(express.json())

const adminRouter = express.Router()
// const adminEmail = process.env.ADMIN_EMAIL;
// const adminPassword = process.env.ADMIN_PASSWORD;

const Validator = zod.object({
    username:zod.string(),
    email: zod.string().email(),
    password: zod.string().min(6)
});

adminRouter.post("/addProduct",async(req,res)=>{
    const body = req.body;
    const success = Validator.safeParse(body);
    if(!success){
        return res.status(411).json({
            msg: "invalid inputs"
        })
    }
    try{
     const response = await User.find({
        username: body.username,
        email:body.email,
        password: bcrypt.hashSync(body.password,10)
     })
     if(!response || !response.isAdmin){
        return res.status(403).json({msg: "no user found"})
     }
     const token = jwt.sign(response._id.toHexString(),SECRET_KEY)

     return res.json({token: token})
    }catch(error){
        return res.json({
            msg: "error while signing in"
        })
    }


    // const body = req.body;
    
    // const success = Validator.safeParse(body);
    // if(!success){
    //     return res.status(403).json({msg:"Inputs invalid "})
    // }


    // try {
    //     const admin = await Admin.findOne({
            
    //         email:body.email
           
    //     })
    //     if(!admin){
    //         return res.status(403).json({msg:"Admin not found "})
    //     }
    //     const response = await Admin.create({
    //         username:body.username,
    //         email:body.email,
    //         password:bcrypt.hashSync(body.password,10)
    //     })
    //     const token = jwt.sign(response._id.toHexString(),process.env.SECRET)
    //     return res.json({
    //         token:token
    //     })
    // } catch (error) {
    //     console.error(error);
    //     return res.status(500).json({msg:"Server error "})
        
    // }
})

module.exports=adminRouter;




