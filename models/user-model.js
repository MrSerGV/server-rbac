module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        role: {
            type: Sequelize.STRING,
        },
    });

    User.associate = function(models) {
        User.hasOne(models.UserProfile, {
            foreignKey: 'user_id',
            as: 'profile',
        });
    };

    return User;
};