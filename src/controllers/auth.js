const { User } = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();


async function Login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({
                message: "Usuario não encontrado!"
            })
        };
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            return res.status(401).send({
                message: "Senha incorreta!"
            })
        };
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
        return res.status(200).send({
            message: "login realizado com sucesso"
        });
    } catch (error) {
        console.error(error)
        return res.status(500).send({
            message: "Erro ao fazer login",
            error: error.message
        })
    }
}


module.exports = {
    Login
}