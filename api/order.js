module.exports = app => {
    const createOrder = async (req, res) => {
        if(!req.body.pedido) return res.status(400).send('Informações do pedido faltando')
        
        const pedido = { ...req.body.pedido }

        if(!pedido.produto || 
            !pedido.produto.length > 0  || 
            !pedido.cpf_cliente ||
            !pedido.id_funcionario ) return res.status(400).send('Informações do pedido faltando!')
        
        const pessoaDb = await app.db('pessoas')
        .select("id")
        .where({ cpf: pedido.cpf_cliente })
        .first()

        if(!pessoaDb) return res.status(400).send('Cliente não tem cadastrado !')

        const clientDb = await app.db('clientes')
        .select("id")
        .where({ id: pessoaDb.id })
        .first()

        let arrayProduto = []

        if(clientDb) {
            const promises = pedido.produto.map(async (produto) => {
                const produtoDb = await app.db('produtos')
                .select("id","valor_unitario")
                .where({ nome: produto.nome })
                .first()
                
                if(produtoDb) {
                    arrayProduto.push({
                        "id": produtoDb.id, 
                        "valor_unitario": produtoDb.valor_unitario,
                        "quantidade_produto": produto.quantidade_produto
                    })
                } else {
                    return null
                }
            })

            const arrayCheckProduto = await Promise.all(promises);
            const errorInProduto = arrayCheckProduto.some(produto => produto === null);

            if(errorInProduto) return res.status(400).send(`A produtos não cadastrados !`)

            if(!errorInProduto) {
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed);

                let valorTotal = 0

                arrayProduto.forEach((produto) => {
                    let valorTotalProduto = 0
                    valorTotalProduto = produto.valor_unitario * produto.quantidade_produto
                    valorTotal = valorTotal + valorTotalProduto
                })

                const newPedido = {
                    "id_cliente": clientDb.id,
                    "valor_total" : valorTotal,
                    "data_pedido" : today
                }

                let idPedido = ""

                await app.db('pedidos')
                    .insert(newPedido)
                    .then((id) => {
                        idPedido = id[0]
                    })
                    .catch(err => res.status(500).send(err))
                
                const funcionarioDb = await app.db('funcionarios')
                    .where({ id: pedido.id_funcionario })
                    .first()
                
                if(!funcionarioDb) return res.status(400).send('Funcionario não cadastrado!')
                
                if(funcionarioDb) {
                    try {
                        const promissesPedidosProdutos = arrayProduto.map(async (produto) => {
                            const pedidoProdutos = {
                                "id_pedido": idPedido,
                                "id_produto": produto.id,
                                "id_funcionario": pedido.id_funcionario,
                                "quantidade_produto": produto.quantidade_produto
                            }
                    
                            await app.db('pedidos_produtos')
                                .insert(pedidoProdutos);
                        });
                    
                        await Promise.all(promissesPedidosProdutos);
                    
                        res.status(204).send();
                    } catch (err) {
                        res.status(500).send(err);
                    }

                }
            }

        }

        return
    }

    return { createOrder }
}