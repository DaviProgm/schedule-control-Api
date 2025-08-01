require("dotenv").config();
const bcrypt = require('bcrypt');

const { User } = require('../models/users');

async function CreateUser(req, res) {
    try {
        const { name, email, password, role } = req.body;

        const validRoles = ['customer', 'provider', 'admin', 'creditor'];
        if (!validRoles.includes(role)) {
            return res.status(400).send({ message: "Role inválido. Use: customer, creditor ou admin" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashPassword, role });

        return res.status(201).send(user);
    } catch (error) {
        console.error('Erro ao criar usuário', error);
        return res.status(500).send({
            message: "Erro ao criar usuário",
            error: error.message
        });
    }
}

async function GetUsers(req, res) {
    try {
        const { role } = req.query;
        let where = {};
        if (role) {
            where.role = role;
        }
        const users = await User.findAll({ where })
        return res.status(200).json(users);
    } catch (error) {
        console.error("Erro ao buscar usuários", error);
        return res.status(500).send({
            message: 'Erro ao buscar usuários',
            error: error.message
        });
    }
}

module.exports = {
    CreateUser,
    GetUsers
};
