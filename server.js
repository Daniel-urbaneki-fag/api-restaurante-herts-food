const consign = require("consign")
const app = require("express")()
const db = require('./config/db')

app.db = db

consign()
    .then('./config/middlewares.js')
    .then('./config/jwtmiddlewares.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

const portHost = 3000

app.listen(portHost, () => {
    console.log("Executando em...", `http://localhost:${portHost}`)
})