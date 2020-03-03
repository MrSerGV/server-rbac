//const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { roles } = require('./roles')

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
};

async function validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

const grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                });
            };
                next()
            } catch (error) {
                next(error)
        };
    };
};

const allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user)
            return res.status(401).json({
                error: "You need to be logged in to access this route"
            });
        req.user = user;
        next();
    } catch (error) {
        next(error);
    };
};

const paginate = (query, { page, pageSize }) => {
    const offset = page * pageSize;
    const limit = pageSize;

    return {
        ...query,
        offset,
        limit,
    };
};

const signup = async (req, res, next) => {
    try {
        const { role, email, password } = req.body
        const hashedPassword = await hashPassword(password);
        const newUser = User.create({ email, password: hashedPassword, role: role || "user" });
        const accessToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        newUser.accessToken = accessToken;
        res.json({
            data: newUser,
            message: "You have signed up successfully"
        })
    } catch (error) {
        next(error)
    };
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: {
              email
            },
              raw: true
        });
        if (!user) return next(new Error('Email does not exist'));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        res.status(200).json({
            data: { email: user.email, role: user.role },
            accessToken
        })
    } catch (error) {
      next(error);
    };
};

const getUsers = async (req, res, next) => {
    const users = await User.findAll(
        paginate(
        {
           where: {}, // conditions
        },
        { page, pageSize },
        ),
    );
    res.status(200).json({
        data: users
    });
};

const getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findOne({where: {userId}});
    if (!user) return next(new Error('User does not exist'));
    res.status(200).json({
      data: user
    });
  } catch (error) {
    next(error)
  };
};

const updateUser = async (req, res, next) => {
  try {
    const { role } = req.body
    const userId = req.params.id;
    const user = await User.update(role, {
      where: { id: userId }
    })
    res.status(200).json({
      data: user
    });
  } catch (error) {
    next(error)
  };
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    await User.destroy({
      where: { id: userId }
    })
    res.status(200).json({
      data: null,
      message: 'User has been deleted'
    });
  } catch (error) {
    next(error)
  };
};

module.exports = {
    grantAccess,
    allowIfLoggedin, 
    signup,
    login,
    getUsers,
    getUser,
    updateUser,
    deleteUser
};