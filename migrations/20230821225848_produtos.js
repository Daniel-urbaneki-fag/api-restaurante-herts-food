/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('produtos', table => {
        table.increments('id').primary()
        table.string('nome').notNullable();    
        table.float('valor_unitario').notNullable();    
        table.float('peso').notNullable();    
        table.string('tipo').notNullable();    
        }
    )}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('produtos');
};
