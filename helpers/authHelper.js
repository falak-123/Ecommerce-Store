const bcrypt = require("bcrypt")

const hashpassword =async (password)=>{
    try{
        const salt = 10;
        const hashedPassword = await bcrypt.hash(password,salt);
        return hashedPassword; 

    }catch(err){
        console.log("error in hashing")
    }
}

const comparepassword =async(password,hashedPassword)=>{
    try{
        return bcrypt.compare(password,hashedPassword);
    }catch(e){
console.log("error in comparing")
    }
    

}
module.exports.hashpassword = hashpassword;
module.exports.comparepassword = comparepassword;