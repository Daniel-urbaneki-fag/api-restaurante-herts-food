module.exports = app => {
    app.post("/createClient", app.api.client.createClient)
    app.post("/createEmployee", app.api.employee.createEmployee)
    app.post("/createProduct", app.api.product.createProduct)
    app.post("/createOrder", app.api.order.createOrder)
}