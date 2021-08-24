module.exports = function (sequelize, DataTypes) {
  const Profile = sequelize.define('Profile', {
    username: DataTypes.STRING,
    display_name: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    birthday: DataTypes.DATE,
    phone_number: DataTypes.STRING,
    avatar_link: DataTypes.STRING,
    country_id: DataTypes.STRING,
    location_name: DataTypes.STRING,
    bio_heading: DataTypes.STRING,
    bio_text: DataTypes.TEXT,
    social_links: DataTypes.TEXT,
    member_level: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    share_public_profile: DataTypes.BOOLEAN,
  }, {
    tableName: 'profiles',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
    underscored: true,
    classMethods: {
    }
  });

  Profile.associate = function (models) {
    Profile.belongsTo(models.User);
  };

  return Profile;
};
