module.exports = app => {
    const createOrder = async (req, res) => {
        if(!req.body.pedido) return res.status(400).send('Informações do pedido faltando')
        
        const pedido = { ...req.body.pedido }

        if(!pedido.produto || 
            !pedido.produto.length > 0  || 
            !pedido.cpf_cliente ||
            !pedido.id_funcionario ||
            !pedido.numero_mesa ) return res.status(400).send('Informações do pedido faltando!')
        
        let isValidate = true
        pedido.produto.map((item) => {
            if(!item.hasOwnProperty("nome") || !item.hasOwnProperty("quantidade_produto")) return isValidate = false
        })

        if(!isValidate) return res.status(400).send('Informações do pedido faltando!')
        
        const pessoaDb = await app.db('pessoas')
        .select("id")
        .where({ cpf: pedido.cpf_cliente })
        .first()

        if(!pessoaDb) return res.status(400).send('Cliente não tem cadastrado !')

        const clientDb = await app.db('clientes')
        .select("id")
        .where({ id_pessoa: pessoaDb.id })
        .first()

        const funcionarioDb = await app.db('funcionarios')
            .where({ id: pedido.id_funcionario })
            .first()
                
        if(!funcionarioDb) return res.status(400).send('Funcionario não cadastrado!')

        const numMesa = await app.db('pedidos')
            .where({ numero_mesa: pedido.numero_mesa })
            .andWhere({ status: true })
            .first()
                
        if(numMesa) return res.status(400).send('A Mesa está com pedidos não finalizados!')

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
                    "valor_devedor": valorTotal,
                    "numero_mesa": pedido.numero_mesa,
                    "data_pedido" : today
                }

                if(pedido.dividir_quantidade) {
                    newPedido.divisao = pedido.dividir_quantidade
                }

                let idPedido = ""

                await app.db('pedidos')
                    .insert(newPedido)
                    .then((id) => {
                        idPedido = id[0]
                    })
                    .catch(err => res.status(500).send(err))
                
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
                    
                        res.status(200).send("Pedido feito com sucesso!");
                    } catch (err) {
                        res.status(500).send(err);
                    }

                }
            }

        } else {
            res.status(500).json({"error": "Ouve algum erro!"})
        }

        return
    }

    const addInOrder = async (req, res) => {
        if(!req.body.pedido) return res.status(400).send('Informações do pedido faltando')
        
        const pedido = { ...req.body.pedido }

        if(!pedido.produto || 
            !pedido.produto.length > 0  || 
            !pedido.id_pedido || !pedido.id_funcionario ) return res.status(400).send('Informações do pedido faltando!')
        
        let isValidate = true
        pedido.produto.map((item) => {
            if(!item.hasOwnProperty("nome") || !item.hasOwnProperty("quantidade_produto")) return isValidate = false
        })

        if(!isValidate) return res.status(400).send('Informações do pedido faltando!')
        
        const pedidoDb = await app.db('pedidos')
            .select("status", "valor_total")
            .where({ id: pedido.id_pedido })
            .first()
        
        if(!pedidoDb || !pedidoDb.status ) return res.status(400).send('Pedido não existe ou já está fechado!')

        const funcionarioDb = await app.db('funcionarios')
            .where({ id: pedido.id_funcionario })
            .first()
                
        if(!funcionarioDb) return res.status(400).send('Funcionario não cadastrado!')

        let arrayProduto = []

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

            valorTotal += Number(pedidoDb.valor_total)

            await app.db('pedidos')
                .where({ id: pedido.id_pedido })
                .update({ valor_total: valorTotal, valor_devedor: valorTotal, data_pedido: today });
            
            try {
                const promissesPedidosProdutos = arrayProduto.map(async (produto) => {
                    const pedidoProdutos = {
                        "id_pedido": pedido.id_pedido,
                        "id_produto": produto.id,
                        "id_funcionario": pedido.id_funcionario,
                        "quantidade_produto": produto.quantidade_produto
                    }
            
                    await app.db('pedidos_produtos')
                        .insert(pedidoProdutos);
                });
            
                await Promise.all(promissesPedidosProdutos);
            
                res.status(200).json("Novos itens adicionados no pedido!");
            } catch (err) {
                res.status(500).send(err);
            }
        }
    }

    const paymentOrder = async (req, res) => {
        if(!req.body.pagamento) return res.status(400).send('Informações do pagamento faltando')
        
        const pagamento = { ...req.body.pagamento }

        if(!pagamento.id_pedido || !pagamento.valor_pagamento) return res.status(400).send('Informações do pagamento faltando ou limite maximo excedido de divisões da conta!')
        
        const pedidoDb = await app.db('pedidos')
            .select("status", "valor_total", "divisao", "valor_devedor")
            .where({ id: pagamento.id_pedido })
            .first()
        
        if(!pedidoDb || !pedidoDb.status ) return res.status(400).send('Pedido não existe ou já está fechado!')
        if(pedidoDb.valor_total === pedidoDb.valor_devedor) {
            if(pagamento.dividir_quantidade) {
                if(!(pagamento.dividir_quantidade > 0 && pagamento.dividir_quantidade <= 4)) return res.status(400).send('A divisão deverá ser maior que 0 e menor ou igual a 4!')
                
                let valorDevedor = pedidoDb.valor_devedor
                valorDevedor -= pagamento.valor_pagamento
    
                let quantidadePagaDivisão = pagamento.dividir_quantidade - 1
    
                await app.db('pedidos')
                    .where({ id: pagamento.id_pedido })
                    .update({ divisao: quantidadePagaDivisão , valor_devedor: valorDevedor});
                
                res.status(200).send(`Pago com sucesso, ainda resta R$ ${valorDevedor},00 a ser pago`)
            } else {
                if(pagamento.dividir_quantidade > 0) return res.status(400).send(`Não poderá ter mais divisões, porque já foi pago uma parte da conta! Divisão: ${pedidoDb.divisao}, Valor devedor: ${pedidoDb.valor_devedor}`)
            
                if(pagamento.valor_pagamento > pedidoDb.valor_devedor) return res.status(400).send(`Pagamento acima do devedor! Deve: R$ ${pedidoDb.valor_devedor},00`)
                if(pedidoDb.divisao === 1 && pagamento.valor_pagamento < pedidoDb.valor_devedor) return res.status(400).send(`Minimo de pagamento deverá ser: R$ ${pedidoDb.valor_devedor},00, pois ainda resta ${pedidoDb.divisao}`)
                
                let valorDevedor = pedidoDb.valor_devedor
                valorDevedor -= pagamento.valor_pagamento

                let quantidadePagaDivisão = pedidoDb.divisao - 1

                if(valorDevedor <= 0) {
                    await app.db('pedidos')
                        .where({ id: pagamento.id_pedido })
                        .update({ divisao: quantidadePagaDivisão , valor_devedor: valorDevedor, status: false});
                    
                    res.status(200).send(`Pago com sucesso e o pedido foi encerrado!`)
                } else {
                    await app.db('pedidos')
                        .where({ id: pagamento.id_pedido })
                        .update({ divisao: quantidadePagaDivisão , valor_devedor: valorDevedor});
                    
                    res.status(200).send(`Pago com sucesso, ainda resta R$ ${valorDevedor},00 a ser pago`)
                }
            }
        } else {
            if(pagamento.dividir_quantidade > 0) return res.status(400).send(`Não poderá ter mais divisões, porque já foi pago uma parte da conta! Divisão: ${pedidoDb.divisao}, Valor devedor: ${pedidoDb.valor_devedor}`)
            
            if(pagamento.valor_pagamento > pedidoDb.valor_devedor) return res.status(400).send(`Pagamento acima do devedor! Deve: R$ ${pedidoDb.valor_devedor},00`)
            if(pedidoDb.divisao === 1 && pagamento.valor_pagamento < pedidoDb.valor_devedor) return res.status(400).send(`Minimo de pagamento deverá ser: R$ ${pedidoDb.valor_devedor},00, pois ainda resta ${pedidoDb.divisao}`)
            
            let valorDevedor = pedidoDb.valor_devedor
            valorDevedor -= pagamento.valor_pagamento

            let quantidadePagaDivisão = pedidoDb.divisao - 1

            if(valorDevedor <= 0) {
                await app.db('pedidos')
                    .where({ id: pagamento.id_pedido })
                    .update({ divisao: quantidadePagaDivisão , valor_devedor: valorDevedor, status: false});
                
                res.status(200).send(`Pago com sucesso e o pedido foi encerrado!`)
            } else {
                await app.db('pedidos')
                    .where({ id: pagamento.id_pedido })
                    .update({ divisao: quantidadePagaDivisão , valor_devedor: valorDevedor});
                
                res.status(200).send(`Pago com sucesso, ainda resta R$ ${valorDevedor},00 a ser pago`)
            }

        }
    }

    const kitchenReport = async (req, res) => {
        await app.db('pessoas')
            .select('pedidos.id','pedidos.numero_mesa', 'pedidos.status', 'pessoas.nome as cliente_nome')
            .innerJoin('clientes', 'pessoas.id', 'clientes.id_pessoa')
            .innerJoin('pedidos', function() {
                this.on('clientes.id', '=', 'pedidos.id_cliente')
                .andOn('pedidos.status', '=', 1)
            })

            .then(async (pedidos) => {
                const resultado = [];
                for (const pedido of pedidos) {
                    const produtos = await app.db('pedidos_produtos')
                    .select('produtos.nome as produto_nome', 'pedidos_produtos.quantidade_produto as quantidade_produto')
                    .innerJoin('produtos', 'pedidos_produtos.id_produto', 'produtos.id')
                    .where({id_pedido: pedido.id});
                    resultado.push({
                        id: pedido.id,
                        numero_mesa: pedido.numero_mesa,
                        status: pedido.status,
                        cliente_nome: pedido.cliente_nome,
                        produtos,
                    });
                }
            
                res.json(resultado);
              })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Ocorreu um erro ao gerar o relatório.' });
            });
        }

    return { createOrder, addInOrder, paymentOrder, kitchenReport }
}