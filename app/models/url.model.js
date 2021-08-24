module.exports = function (sequelize, DataTypes) {
  const Url = sequelize.define('Url', {
    urlname: DataTypes.STRING,
    url: DataTypes.STRING,
    image: DataTypes.STRING,
    country : DataTypes.STRING,
    currency : DataTypes.STRING,
    current_price : DataTypes.STRING,
    desired_price : DataTypes.STRING,
    description : DataTypes.STRING,
    domain : DataTypes.STRING,
    name : DataTypes.STRING,
    short_url : DataTypes.STRING,
    title : DataTypes.STRING,
    other_url : DataTypes.STRING,
    expire_at : DataTypes.DATE,
    bell: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_at : DataTypes.DATE,
  }, {
    tableName: 'urls',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
    underscored: true,
    classMethods: {
    }
  });

  Url.associate = function (models) {
    Url.belongsTo(models.User);
  };

  return Url;
};