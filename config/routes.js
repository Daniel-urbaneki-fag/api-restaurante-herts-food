const jwtFunctions = require('./jwtmiddlewares')
module.exports = app => {
    app.post("/createClient",jwtFunctions.verifyJwToken, app.api.client.createClient)
    app.post("/createEmployee",jwtFunctions.verifyJwToken, app.api.employee.createEmployee)
    app.post("/createProduct",jwtFunctions.verifyJwToken, app.api.product.createProduct)
    app.get("/getProducts",jwtFunctions.verifyJwToken, app.api.product.getProducts)
    app.post("/createOrder",jwtFunctions.verifyJwToken, app.api.order.createOrder)
    app.post("/addInOrder",jwtFunctions.verifyJwToken, app.api.order.addInOrder)
    app.post("/paymentOrder",jwtFunctions.verifyJwToken, app.api.order.paymentOrder)
    app.get("/kitchenReport",jwtFunctions.verifyJwToken, app.api.order.kitchenReport)
    app.post("/login", jwtFunctions.createJwToken , app.api.login.login)
    // app.post("/login", app.api.login.login)
}