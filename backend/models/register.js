const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
        minlength:6
    },
    email:{
        type:String,
        required:true
    },
    phno:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:'customer'
    }
},{timestamps:true})

const register = new mongoose.model("Users",registerSchema)

module.exports = register;
