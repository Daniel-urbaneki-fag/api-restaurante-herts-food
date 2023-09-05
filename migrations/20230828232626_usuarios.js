/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('usuarios', table => {
        table.increments('id').primary()
        table.integer("cargo").defaultTo(0)
        table.boolean("ativo").defaultTo(true)
        table.date("data_inicio").notNullable()
        table.date("data_desligamento").defaultTo(null)
        table.string('usuario').notNullable()
        table.string('senha').notNullable()
        table.integer('id_funcionario').unsigned().references('id').inTable('funcionarios').notNullable();    
    })}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('usuarios');
};