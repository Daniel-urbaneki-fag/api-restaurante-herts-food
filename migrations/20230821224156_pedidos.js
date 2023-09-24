/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('pedidos', table => {
        table.increments('id').primary()
        table.integer('valor_total').notNull()
        table.integer('valor_devedor').notNull()
        table.integer('divisao').notNull().defaultTo(1)
        table.integer('numero_mesa').notNull()
        table.boolean('status').notNull().defaultTo(true)
        table.string('data_pedido').notNull()
        table.integer('id_cliente').unsigned().references('id').inTable('clientes').notNullable();    
    })}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('pedidos');
};
