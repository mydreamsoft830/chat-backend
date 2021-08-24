module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn(
        'urls',
        'description',
        Sequelize.DataTypes.TEXT('long')
      ),
    ]).catch(e => console.log(e));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('urls');
  }
};