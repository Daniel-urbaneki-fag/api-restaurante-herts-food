module.exports = app => {
    const createEmployee = async (req, res) => {
        if(!req.body.endereco) return res.status(400).send('Informar Endereço')
        if(!req.body.pessoa) return res.status(400).send('Informar Pessoa')
        if(!req.body.usuario) return res.status(400).send('Informar Usuário')
        
        const pessoa = { ...req.body.pessoa }
        const endereco = {...req.body.endereco }
        const usuario = {...req.body.usuario }

        if(!endereco.logradouro || 
            !endereco.numero  || 
            !endereco.complemento ||
            !endereco.bairro ||
            !endereco.cep ||
            !endereco.cidade ||
            !endereco.estado) return res.status(400).send('Endereço incompleto!')
        
        if(!pessoa.nome || !pessoa.email || !pessoa.telefone) return res.status(400).send('Informar Nome/Email/Telefone')
        if(!pessoa.cpf) return res.status(400).send('Informar Cpf!')
        if(!usuario.usuario || !usuario.senha) return res.status(400).send('Informar Usuário e senha!')
        
        const pessoaDb = await app.db('pessoas')
        .where({ cpf: pessoa.cpf })
        .first()

        if(pessoaDb) return res.status(400).send('Já esta cadastrado a pessoa!')

        const emailTrue = await app.db('pessoas')
        .where({ email: pessoa.email })
        .first()

        if(emailTrue) return res.status(400).send('Email já esta cadastrado !')

        let idEndereco = await app.db('enderecos')
            .select('id')
            .where({ cep: endereco.cep  })
            .andWhere({ numero: endereco.numero })
            .first()
        
        if(!idEndereco) {
            endereco.logradouro = endereco.logradouro.charAt(0).toUpperCase() + endereco.logradouro.slice(1)
            endereco.complemento = endereco.complemento.charAt(0).toUpperCase() + endereco.complemento.slice(1)
            endereco.bairro = endereco.bairro.charAt(0).toUpperCase() + endereco.bairro.slice(1)
            endereco.cidade = endereco.cidade.charAt(0).toUpperCase() + endereco.cidade.slice(1)
            endereco.estado = endereco.estado.charAt(0).toUpperCase() + endereco.estado.slice(1)
            await app.db('enderecos')
            .insert(endereco)
            .then(_ => res.status(204))
            .catch(err => res.status(500).send(err))
            
            idEndereco = await app.db('enderecos')
            .select('id')
            .where({ cep: endereco.cep  })
            .andWhere({ numero: endereco.numero })
            .first()
        }
        
        pessoa.id_endereco = idEndereco.id

        if(!pessoaDb) {
            pessoa.nome = pessoa.nome.charAt(0).toUpperCase() + pessoa.nome.slice(1)
            await app.db('pessoas')
                .insert(pessoa)
                .then(_ => res.status(204))
                .catch(err => res.status(500).send(err))
        }

        const idPessoa = await app.db('pessoas')
            .select('id')
            .where({ cpf: pessoa.cpf })
            .first()
        
        // console.log(idPessoa)

        const employee = {
            "id_pessoa": idPessoa.id
        }

        let idFuncionario = ""

        await app.db('funcionarios')
        .insert(employee)
        .then((id) => {
            idFuncionario = id[0]
        })
        .catch(err => res.status(500).send(err))

        usuario.id_funcionario = idFuncionario

        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);

        usuario.data_inicio = today

        await app.db('usuarios')
        .insert(usuario)
        .then(_ => res.status(200).json({"msg": "Usuário cadastrado com sucesso!"}))
        .catch(err => res.status(500).send(err))
    }

    return { createEmployee }
}