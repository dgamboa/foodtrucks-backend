exports.up = async function(knex) {
  await knex.schema
    .createTable('users', (users) => {
      users.increments('user_id')
      users.string('username', 200).notNullable()
      users.string('email', 200).notNullable()
      users.string('password', 320).notNullable()
      users.float('user_lat')
      users.float('user_long')
      users.timestamps(false, true)
    })
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users')
};
