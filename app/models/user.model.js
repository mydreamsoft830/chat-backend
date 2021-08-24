module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('User', {
    email: {type: DataTypes.STRING},
    username: {type: DataTypes.STRING(64)},
    token: DataTypes.STRING(64),
    token_created_at: DataTypes.DATE,
    role: DataTypes.STRING,
    password: DataTypes.STRING,
    verified: DataTypes.BOOLEAN,
    account_status: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    pw_token: DataTypes.STRING(4),
    pw_token_expire_at: DataTypes.DATE,
    new_user: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
    underscored: true,
    classMethods: {
    }
  });

  User.associate = function (models) {
    User.hasOne(models.Profile);
    User.hasMany(models.Url);
    // User.hasOne(models.UserSettings);
    // User.belongsToMany(models.School, {through: models.SchoolUser});
    // User.belongsToMany(models.Subscription, {through: models.SubscriptionUser});
    // User.belongsToMany(models.Employer, {through: models.EmployerUser});
    // User.belongsToMany(models.CareerCenter, {through: models.CareerCenterUser});
    // User.hasMany(models.Contact, {as: 'owner'});
    // User.hasOne(models.Student);
  };
  return User;
};