const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo");
const mongoose = require("mongoose")
const fileUpload = require('express-fileupload')
const cloudinary = require("cloudinary").v2;
const Razorpay = require('razorpay');
const dotenv = require('dotenv')
dotenv.config()


const PORT = process.env.PORT || 13000
const app = express();


app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile);

const razorpay = new Razorpay({
    key_id: 'rzp_test_99Kx2xlSYCl4cU',
    key_secret: 'L3yiJRYsLb9RbuUBMZ2BEcpi'
})

const url = process.env.MONGO_URL
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((c) => {
    console.log(c)
})

const connection = mongoose.connection;
app.use(session({
    secret: 'secretcode',
    resave: false,
    store: MongoDbStore.create({ mongoUrl: 'mongodb://localhost:27017/intern' }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }

}))

app.use((req, res, next) => {
    res.locals.session = req.session
    let h = res.locals.session
    let q = req.session.user
    // console.log(h)
    // console.log(q)
    next()
})






const Register = require("./backend/models/register");
const Product = require('./backend/models/products');
const Order = require('./backend/models/order');
const Vendor = require('./backend/models/vendor')
const { async } = require("q");
const { json } = require("body-parser");



app.use("/static", express.static('./static/'));

app.use(flash())
app.use(fileUpload({
    useTempFiles: true
}))


//Setting Cloudinary
cloudinary.config({
    cloud_name: 'dfdijtbyl',
    api_key: '773451612241425',
    api_secret: '2sr9t0mWlOPMcP70tzHbp5xSUM8',
    secure: true
});



app.post('/paymen', (req, resp) => {


    let options = {
        amount: req.session.cart.totalPrice * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"

    };

    razorpay.orders.create(options, (err, order) => {
        resp.json(order)
    })
})

app.post('/is-order-complete', (req, resp) => {
    console.log(req.session)
    razorpay.payments.fetch(req.body.razorpay_payment_id).then((document) => {
        console.log(document.status)
        if (document.status === 'captured') {
            console.log(req.session)
            delete req.session.cart
            resp.redirect('/')
        }
    })


})

app.post("/api/payment/verify", (req, res) => {

    let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', '<YOUR_API_SECRET>')
        .update(body.toString())
        .digest('hex');
    console.log("sig received ", req.body.response.razorpay_signature);
    console.log("sig generated ", expectedSignature);
    var response = { "signatureIsValid": "false" }
    if (expectedSignature === req.body.response.razorpay_signature)
        response = { "signatureIsValid": "true" }
    console.log(response)
    res.send(response);


});

app.post('/update-cart', (req, resp) => {

    if (!req.session.cart) {
        req.session.cart = {
            items: {},
            totalQty: 0,
            totalPrice: 0
        }
    }
    let cart = req.session.cart

    // Check if item does not exist in cart 
    if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
            item: req.body,
            qty: 1
        }
        cart.totalQty = cart.totalQty + 1
        cart.totalPrice = cart.totalPrice + req.body.Price
    } else {
        cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1
        cart.totalQty = cart.totalQty + 1
        cart.totalPrice = cart.totalPrice + req.body.Price
    }
    console.log({ totalQty: req.session.cart.totalQty })
    return resp.json({ totalQty: req.session.cart.totalQty })

})





app.post('/modify-cart', (req, resp) => {


    // Check if item does not exist in cart 
    if (req.session.cart.items[req.body.item._id]) {
        const x = req.session.cart.items[req.body.item._id].qty
        const y = req.session.cart.items[req.body.item._id].item.Price
        const z = x * y

        req.session.cart.totalQty = req.session.cart.totalQty - req.session.cart.items[req.body.item._id].qty
        req.session.cart.totalPrice = req.session.cart.totalPrice - z
        delete req.session.cart.items[req.body.item._id]
        console.log({ totalQty: req.session.cart.totalQty })
        var redir = { redirect: "/" };
        return resp.json(redir);

    }
})


//Sign Up form 
app.post("/sign_up", async (req, resp) => {
    var username = req.body.username
    var name = req.body.name
    var email = req.body.email
    var phno = req.body.phno
    var password = req.body.password
    var confirmPassword = req.body.confirmPassword

    // Register.exists({ email: email }, (err, result) => {
    //     if (result) {
    //         req.flash('error', 'Email already taken')
    //         req.flash('name', name)
    //         req.flash('email', email)
    //         return resp.redirect('/register')
    //     }
    // })

    if (password === confirmPassword) {

        const registerUser = new Register({
            username: username,
            name: name,
            email: email,
            phno: phno,
            password: password,
        })

        await registerUser.save().then((user) => {
            return resp.redirect('/')
        }).catch(err => {
            req.flash('error', 'Something went wrong')
            return resp.render('signup_success')
        })
    }
})

//vendor Signup
app.post("/sign_up_vendor", async (req, resp) => {
    var vendorcode = req.body.vendorcode
    var name = req.body.name
    var email = req.body.email
    var phno = req.body.phno
    var password = req.body.password
    var confirmPassword = req.body.confirmPassword

    // Register.exists({ email: email }, (err, result) => {
    //     if (result) {
    //         req.flash('error', 'Email already taken')
    //         req.flash('name', name)
    //         req.flash('email', email)
    //         return resp.redirect('/register')
    //     }
    // })

    if (password === confirmPassword) {

        const registerUser = new Vendor({
            vendorcode: vendorcode,
            name: name,
            email: email,
            phno: phno,
            password: password,
        })

        await registerUser.save().then((user) => {
            return resp.redirect('/')
        }).catch(err => {
            req.flash('error', 'Something went wrong')
            return resp.render('signup_success')
        })
    }
})

//Checkout Details
app.post("/checkout", (req, resp) => {
    var phone = req.body.phone
    var address = req.body.address
    // if(!phone || !address){
    //     return resp.redirect("/checkout")
    // }

    if (!req.session.billing) {
        req.session.billing = {
            address: '',
            phone: '',
        }
    }
    var bill = req.session.billing
    bill.address = address
    bill.phone = phone

    resp.redirect('/payment')

})

//Admin Update order status
app.post('/admin/order/status', (req, resp) => {
    Order.updateOne({ _id: req.body.orderId }, { status: req.body.status }, (err, data) => {
        if (err) {
            resp.redirect('/admin/order')
        } else {
            resp.redirect('/admin/order')
        }
    })
})

//Add Product -- Admin Only
app.post('/admin/product', async (req, resp) => {
    const file = req.files.BackgroundImage
    cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
        console.log(result)
        const fileTwo = req.files.FrontImage
        cloudinary.uploader.upload(fileTwo.tempFilePath, async (err, res) => {
            console.log(res)
            var ProductName = req.body.ProductName
            var Navigate = req.body.Navigate
            var ProductHeading = req.body.ProductHeading
            var Price = req.body.Price
            var BackgroundImage = result.url
            var FrontImage = res.url
            var ProductDescription = req.body.ProductDescription
            var ProductCode = req.body.ProductCode
            var Material = req.body.Material
            var Style = req.body.Style
            var Color = req.body.Color
            var Dimension = req.body.Dimension
            var WoodSpecies = req.body.WoodSpecies
            var ProductDetail = req.body.ProductDetail
            var Type = req.body.Type

            const newProduct = new Product({
                ProductName: ProductName,
                Navigate: Navigate,
                ProductHeading: ProductHeading,
                Price: Price,
                BackgroundImage: BackgroundImage,
                FrontImage: FrontImage,
                ProductDescription: ProductDescription,
                ProductCode: ProductCode,
                Material: Material,
                Style: Style,
                Color: Color,
                Dimension: Dimension,
                WoodSpecies: WoodSpecies,
                ProductDetail: ProductDetail,
                Type: Type
            })

            await newProduct.save().then((product) => {
                resp.redirect('/admin')
            }).catch(err => {
                resp.redirect('/')
            })

        })

    })
})

app.post('/admin/product/update/:id', async (req, resp) => {
    console.log(req.body)
    var ProductName = req.body.ProductName
    var Navigate = req.body.Navigate
    var ProductHeading = req.body.ProductHeading
    var Price = req.body.Price
    var ProductDescription = req.body.ProductDescription
    var ProductCode = req.body.ProductCode
    var Material = req.body.Material
    var Style = req.body.Style
    var Color = req.body.Color
    var Dimension = req.body.Dimension
    var WoodSpecies = req.body.WoodSpecies
    var ProductDetail = req.body.ProductDetail
    var Type = req.body.Type
    await Product.updateOne({ _id: req.params.id }, {
        ProductName: ProductName,
        Navigate: Navigate,
        ProductHeading: ProductHeading,
        Price: Price,
        ProductDescription: ProductDescription,
        ProductCode: ProductCode,
        Material: Material,
        Style: Style,
        Color: Color,
        Dimension: Dimension,
        WoodSpecies: WoodSpecies,
        ProductDetail: ProductDetail,
        Type: Type
    }).then(() => {
        resp.redirect('/admin')
    }).catch(err => {
        resp.render('notfound')
    })
})

require('./backend/routes/web')(app)

app.listen(PORT, '0.0.0.0', () => {
    console.log("Server Running");
})