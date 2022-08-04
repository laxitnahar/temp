const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema({
    vendorcode:{
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
        default:'admin'
    }
},{timestamps:true})

const vendor = new mongoose.model("Vendor",registerSchema)

module.exports = vendor;
