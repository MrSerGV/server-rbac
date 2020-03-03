module.exports = (sequelize, Sequelize) => {
    const UserProfile = sequelize.define("userProfile", {
        user_id: {
           type: Sequelize.INTEGER
        },
        firstName: {
            type: Sequelize.STRING
        },
        secondName: {
            type: Sequelize.STRING
        },
        avatar: {
            type: Sequelize.STRING,
        },
    });

    return UserProfile;
};