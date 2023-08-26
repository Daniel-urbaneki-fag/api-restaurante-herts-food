/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('clientes', table => {
        table.increments('id').primary()
        table.integer('num_pedidos').defaultTo(0)
        table.integer('id_pessoa').unsigned().references('id').inTable('pessoas').notNullable();    
    })}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('clientes');
};
