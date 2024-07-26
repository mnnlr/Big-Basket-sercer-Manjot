const jwt = require("jsonwebtoken");
require("dotenv").config()

 function Auth(req,res,next){
    const header = req.headers?.authorization
    try {
        const token = jwt.verify(header,process.env.SECRET)
      // console.log(token)
    if(token){
      req.userId= token
      next();
    }
   
    } catch (error) {
    return res.status(403).json({msg:"Cannot perform operation"})
        
    }
}
module.exports= Auth

