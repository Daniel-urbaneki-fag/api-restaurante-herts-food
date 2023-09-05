module.exports = app => {
    app.post("/createClient", app.api.client.createClient)
    app.post("/createEmployee", app.api.employee.createEmployee)
    app.post("/createProduct", app.api.product.createProduct)
    app.get("/getProducts", app.api.product.getProducts)
    app.post("/createOrder", app.api.order.createOrder)
    app.post("/addInOrder", app.api.order.addInOrder)
    app.post("/paymentOrder", app.api.order.paymentOrder)
    app.post("/login", app.api.login.login)
}