import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('fullname').notNullable()
      table.string('email', 50).notNullable().unique()
      table.string('password').notNullable()
      table.string('area').notNullable()
      table.string('tel').notNullable()
      table.string('img').notNullable()
      table.boolean('enabled').defaultTo(false)
      table.boolean('isAdmin').defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
