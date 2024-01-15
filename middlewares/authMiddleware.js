const JWT = require("jsonwebtoken");
const usermodel = require("../models/usermodel");

const requireSignIn =async (req,res,next)=>{
   try{
    const decode = JWT.verify(
        req.headers.authorization,process.env.JWT_SECRETKEY
    ) 
    req.user = decode
    next();
   }catch(e){
console.log("error in verifying")
   }
}

const isAdmin = async (req, res, next) => {
    try { 
      const user = await usermodel.findById(req.user._id);
      if (user.role !== 1) {
        return res.status(401).send({
          success: false,
          message: "UnAuth",
        });
      } else {
        next();
      }
    } catch (err) {
      res.send(err);
      console.log(err);
    }
  };


module.exports.requireSignIn = requireSignIn;
module.exports.isAdmin = isAdmin;