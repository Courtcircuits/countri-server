import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'invites'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.integer('receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
      table.string('invite_code').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['room_id', 'sender_id', 'receiver_id']) // a user can only invite another user once
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
