module.exports = app => {
    const login = async (req, res) => {
        if(!req.body.usuario) return res.status(500).send("Informar usuário e senha!")

        const usuario = { ...req.body.usuario }

        if(!usuario.usuario || !usuario.senha) return res.status(500).send("Informar usuário e senha!")

        let isLogin = await app.db('usuarios')
            .select('id')
            .where({ usuario: usuario.usuario  })
            .andWhere({ senha: usuario.senha })
            .first()
        
        if(!isLogin) return res.status(500).send("Usuário/ senha incorretos!")
        if(isLogin) return res.status(200).send({ message: "Usuário logado com sucesso!", token: req.token })
    }

    return { login }
}