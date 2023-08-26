/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('pedidos_produtos', table => {
        table.increments('id').primary()
        table.integer('id_pedido').unsigned().references('id').inTable('pedidos').notNullable();    
        table.integer('id_produto').unsigned().references('id').inTable('produtos').notNullable();    
        table.integer('id_funcionario').unsigned().references('id').inTable('funcionarios').notNullable();    
        table.integer('quantidade_produto').notNullable();    
    }
    )}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('pedidos_produtos');
};
