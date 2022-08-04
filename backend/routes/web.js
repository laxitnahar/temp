const product = require('../models/products')
const register = require('../models/register')
const order = require('../models/order');
// const { async } = require('q');


function initRoutes(app) {
    //Home page 
    app.get("/", async (req, resp) => {
        // const products = await product.find()
        // console.log(products)
        // resp.render('index',{products:products})


        product.find().then(
            function (products) {
                // console.log(pizzas)
                return resp.render('index', { products: products })
            }
        )
    })

    //Signup
    app.get("/signup", (req, resp) => {
        resp.render('registration')
    })

    //login
    app.get("/login", (req, resp) => {
        if (!req.session.user) {
            resp.render('login')
        } else {
            resp.redirect('/')
        }
    })

    //vendor singup
    app.get("/signup/vendor", (req, resp) => {
        resp.render('admin/signup')
    })

    //product
    app.get("/product", (req, resp) => {
        resp.render('products');
    })

    //Cart
    app.get("/cart", (req, resp) => {
        resp.render('temp');
    })

    //Checkout
    app.get("/checkout", (req, resp) => {
        if (req.session.user) {
            return resp.render('checkout')
        } else {
            resp.redirect('/')
        }
    })

    //Customer Order
    app.get('/customer/order', async (req, resp) => {
        // var order = await order.find({customerId:req.session.user._id})
        // resp.render('order',{order:order})
        if (req.session.user) {
            order.find({ customerId: req.session.user._id }).then(
                function (order) {
                    // console.log(pizzas)
                    return resp.render('order', { order: order }, null, { sort: { 'createdAt': -1 } })
                }
            )
        } else {
            return resp.redirect('/')
        }
        // console.log(orders)
    })


    //Each Page of My Order
    app.get('/customer/:ids', (req, resp) => {
        var a = []
        if (req.session.user) {
            order.findById(req.params.ids).then(function (order) {

                if(req.session.user._id.toString() === order.customerId.toString())
                {
                parsedItems = Object.values(order.item)
                parsedItems.map((menuItem) => {
                    a.push(menuItem)
                })
                return resp.render('customer/myorder', { order: order, a: a })
            }else{
               return resp.render('notfound')
            }
            })
        } else {
            resp.redirect('/')
        }
    });

    //Logout 
    app.get('/logout', (req, resp) => {
        req.session.user = null
        resp.redirect('/')
    });

    app.get('/admin',(req,resp)=>{
        if(req.session.user && req.session.user.role === 'admin'){
        return resp.render('admin/home')
        }else{
            console.log("permission Required")
        }
    })
    

    //Add Product For Admin
    app.get('/admin/product',(req,resp)=>{
        if(req.session.user.role === 'admin'){
            return resp.render('admin/product')
        }else{
            resp.redirect('/')
        }
    })

    // Admin Orders 
    app.get('/admin/order', (req, res) => {
        if(req.session.user && req.session.user.role === 'admin'){
        order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 } }).populate('customerId', '-password')
        .exec((err, order) => {
            if(req.xhr){
                return res.json(order)
            }else{
                return  res.render('admin/order')
            }
            // return resp.render('admin/order',{order:order})
        })
    }else{
        return res.render('notfound')
    }
    })

    app.get('/admin/order/:ids', (req, resp) => {
        var a = []
        if (req.session.user && req.session.user.role==='admin') {
            order.findById(req.params.ids).then(function (order) {
                parsedItems = Object.values(order.item)
                parsedItems.map((menuItem) => {
                    a.push(menuItem)
                })
                return resp.render('customer/myorder', { order: order, a: a })
            })
        } else {
            resp.redirect('/')
        }
    });

    app.get('/admin/product/remove',(req,resp)=>{
        product.find().then(
            function (products) {
                return resp.render('admin/delete', { products: products })
            }
        )
    })

    app.get('/admin/product/remove/:id',async(req,resp)=>{
        if(req.session.user.role==='admin')
        {
        await product.deleteOne({_id:req.params.id}).then(()=>{
            resp.redirect('/admin')
        })
    }else{
        return resp.render('notfound')
    }
    })

    app.get('/admin/product/update/:id',async(req,resp)=>{
        if(req.session.user.role==='admin')
        {
            product.findOne({_id:req.params.id}).then(
                function (products) {
                    return resp.render('admin/update',{products:products})
                }
            )
        
    }else{
        return resp.render('notfound')
    }
    })

    app.get("/payment",(req,resp)=>{
        return resp.render('payment')
    })
}



module.exports = initRoutes;
