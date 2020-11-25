import express from 'express';
import bodyParser from 'body-parser';

import { Product } from './model/product';


import cors from 'cors';
import * as authController from './controller/AuthController';

const app = express();
const PORT = process.env.PORT || 9010;

let products: Array<Product>;

function load(){
    products = new Array<Product>();
    products.push(new Product(1, "Apple IPhone 11", 80000, "6.1-inch (15.5 cm) Liquid Retina HD LCD display, 128GB"));
    products.push(new Product(2, "LG OLED TV", 6000, "4K Ultra HD Smart OLED TV "));
    products.push(new Product(3, "Lenovo ThinkPad E470", 35000, "Intel Core i5 10th Gen 14-inch Full HD IPS Thin and Light Laptop"));
    products.push(new Product(4, "Sony HT-RT3 Real 5.1ch Dolby Digital", 45000, "Soundbar Home Theatre System"));
    products.push(new Product(5, "Samsung Galaxy Watch Active 2", 90000, "With Super AMOLED Display"));
}

load();

//Middleware(intercepts the request==> preprocessing)
app.use((req, resp, next) => {

    console.log(`In middleware ${req.originalUrl} , process id: ${process.pid}`);
    next();
});


//Enable CORS
app.use(cors());



app.use(bodyParser.json());

//app.use("/products", authController.authorizeProducts);

app.post("/login", authController.loginAction);
app.post("/refreshToken", authController.refreshToken);


app.get("/products", (req, resp) => {

    resp.json(products);
});
app.get("/products/:id", (req, resp) => {

    const id = req.params.id;
    if(id){
        const product = products.find(item => item.id.toString() === id);
        if(product){
            resp.json(product);
        }
        else{
            resp.status(404).send();
        }
    }
    else{
        resp.status(400).send();
    }
    
});



app.delete("/products/:id", (req, resp) => {

    //id exists ==> remove status: 200
    // not exist  ==>  status: 404
    // error ==> 500

    const id = req.params.id;
    try {
        
        const index = products.findIndex(item => item.id === parseInt(id))
        if(index !== -1){
            products.splice(index, 1);
            resp.status(200).send();
        }
        else{
            resp.status(404).send();
        }
    } catch (error) {
        resp.status(500).send();
    }

});

app.put("/products", (req, resp)=> {

    // product not found == 404
    // is found and valid ==> update ==> 200
    // invalid ==> 400
    // error ==> 500

    try {
        const id = req.params.id;
        const product = req.body;        
        const index = products.findIndex(item => item.id === product.id)
        if(index !== -1){
            products[index] = product;
            resp.status(200).send();
        }
        else{
            resp.status(404).send();
        }


    } catch (error) {
        resp.status(500).send();
    }
})

//create a new product
app.post("/products", (req, resp) => {

    // Validate the product ==> not valid ==> status: 400(Bad request)
    // Valid product ==> update the data-store => status: 201(Created)
    // Error is saving ==> status: 500(ISR)

    try {

        const product = req.body;
        const index = products.findIndex(item => item.id === product.id);
        if(index === -1){

            products.push(product);
            resp.status(201)
            resp.end();

        }
        else{

            //No Valid
            resp.status(400).send();
        }
    } catch (error) {
        //error
        resp.status(500).send();
    }

    

})






app.listen(PORT, () => {
    console.log(`REST API running on port ${PORT} with process id: ${process.pid}`);
})

