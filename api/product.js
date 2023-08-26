module.exports = app => {
    const createProduct = async (req, res) => {
        if(!req.body.produto) return res.status(400).send('Informar Produto!')
        
        const produto = {...req.body.produto }

        if(!produto.nome || 
            !produto.valor_unitario  || 
            !produto.peso ||
            !produto.tipo ) return res.status(400).send('Informações do produto incorreto!')
        
        produto.nome = produto.nome.charAt(0).toUpperCase() + produto.nome.slice(1)
        produto.tipo = produto.tipo.charAt(0).toUpperCase() + produto.tipo.slice(1)
        await app.db('produtos')
        .insert(produto)
        .then(_ => res.status(204).send())
        .catch(err => res.status(500).send(err))

        return
    }

    return { createProduct }
}