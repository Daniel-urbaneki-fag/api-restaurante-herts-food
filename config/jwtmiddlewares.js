const jwt = require('jsonwebtoken')

const verifyJwToken = (req, res, next) => {
    const token = req.headers['x-access-token']
    if(!token) return res.status(401).json({auth: false, message: 'Token inválido!'})

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
        if(err) return res.status(500).json({auth: false, message: 'Falha na autenticação do token!'})
        
        req.userId = decoded.id
        next()
    })
}

const createJwToken = (req, res, next) => {
    const usuario = { ...req.body.usuario }
    if(!usuario.usuario || !usuario.senha) return res.status(500).send("Informar usuário e senha!")
    const user = {
        username: usuario.usuario,
    };
    const options = {
        expiresIn: '168h',
    };
    const token = jwt.sign(user, process.env.SECRET, options);
    req.token = token
    next()
}
module.exports = {createJwToken, verifyJwToken}