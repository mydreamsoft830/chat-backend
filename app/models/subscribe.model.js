module.exports = function (sequelize, DataTypes) {
  const Subscribe = sequelize.define('Subscribe', {
    email: {type: DataTypes.STRING},
  }, {
    tableName: 'subscribes',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
    underscored: true,
    classMethods: {
    }
  });
  return Subscribe;
};