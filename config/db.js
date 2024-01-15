const mongoose = require("mongoose");


const connectDB =async ()=>{
    try{
const conn = await mongoose.connect(process.env.URI)
console.log("server connected successfuly");
    }catch(err){
console.log(`error in mongodb ${err}`)
    }
}

module.exports = connectDB;