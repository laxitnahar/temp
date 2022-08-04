const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    ProductName:{
        type:String,
        required:true
    },
    Navigate:{
        type:String,
        required:true,
    },
    ProductHeading:{
        type:String,
        required:true
    },
    Price:{
        type:Number,
        required:true,
    },
    BackgroundImage:{
        type:String,
        required:true,
    },
    FrontImage:{
        type:String,
        required:true,
    },
    ProductDescription:{
        type:String,
        required:true
    },
    ProductCode:{
        type:String,
        required:true
    },
    Material:{
        type:String,
        required:true
    },
    Style:{
        type:String,
        required:true
    },
    Color:{
        type:String,
        required:true
    },
    Dimension:{
        type:String,
        required:true
    },
    WoodSpecies:{
        type:String,
        required:true
    },
    ProductDetail:{
        type:String,
        required:true
    },
    Type:{
        type:String,
        required:true
    }
})

const product = new mongoose.model("Products",productSchema)

module.exports = product;
