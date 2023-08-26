/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('funcionarios', table => {
        table.increments('id').primary()
        table.integer('id_pessoa').unsigned().references('id').inTable('pessoas').notNullable();    
    })}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('funcionarios');
};
