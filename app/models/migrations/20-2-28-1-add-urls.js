module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'urls',
        'bell',
        Sequelize.DataTypes.BOOLEAN
      ),
      queryInterface.addColumn(
        'urls',
        'last_at',
        Sequelize.DATE
      ),
    ]).catch(e => console.log(e));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('urls');
  }
};