// import axios from '';

// const API = axios.create({
// 	baseURL: 'http://localhost:3000/',
// })

// export default API;
// const axios = require('axios');
// const axios = require('axios').default;
// import { initAdmin } from './admin'

let cart = document.querySelector('#cartCounter')

let add = document.querySelectorAll('.add-to-cart')

function updateCart(products){
    axios.post('/update-cart',products).then(res=>{
        cart.innerHTML = res.data.totalQty
    })
}


add.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        console.log(e)
        let products = JSON.parse(btn.dataset.products)
        console.log(products)
        console.log("hi")
        updateCart(products)
    })
})

// initAdmin();



