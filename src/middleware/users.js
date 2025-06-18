const { User } = require('../models/users');
const bcrypt = require('bcrypt');


async function ValidateCreateUser(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({
            message: "Email & Senha são obrigatorios!"
        });
    }
    if (req.body.password.length < 8) {
        return res.status(400).send({
            message: "A senha deve ter pelo menos 8 caracteres"
        });
    }
    const existingUser = await User.findOne({ where: {email: req.body.email}});

    if(existingUser){
        return res.status(400).send({
            message:"Usuario já existe"
        });
    }
    next();
}

module.exports = {
    ValidateCreateUser
}