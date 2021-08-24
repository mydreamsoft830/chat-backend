module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'users',
        'pw_token',
        Sequelize.DataTypes.STRING(4)
      ),
      queryInterface.addColumn(
        'users',
        'pw_token_expire_at',
        Sequelize.DATE
      ),
    ]).catch(e => console.log(e));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};