require("dotenv").config();
const axios = require('axios');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Helper function to convert a string to a URL-friendly slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

// Helper function to generate a unique username
const generateUniqueUsername = async (name) => {
  let baseUsername = slugify(name);
  let username = baseUsername;
  let counter = 1;
  
  // Check if username already exists
  while (await User.findOne({ where: { username } })) {
    username = `${baseUsername}-${counter}`;
    counter++;
  }
  return username;
};

async function CreateUser(req, res) {
    try {
        const { name, email, password, role, cpfCnpj } = req.body;

        const validRoles = ['customer', 'provider', 'admin', 'creditor'];
        if (!validRoles.includes(role)) {
            return res.status(400).send({ message: "Role inválido. Use: customer, creditor ou admin" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashPassword, role });

        // Create customer in Asaas
        const asaasResponse = await axios.post(`${process.env.ASAAS_API_URL}/customers`, {
            name,
            email,
            cpfCnpj
        }, {
            headers: {
                'access_token': process.env.ASAAS_TOKEN
            }
        });

        const asaasCustomerId = asaasResponse.data.id;

        // Generate a unique username
        const username = await generateUniqueUsername(name);

        // Update user with asaasCustomerId and username
        await user.update({ asaasCustomerId, username });

        await user.reload(); // Recarrega os dados do usuário do banco

        return res.status(201).send(user);
    } catch (error) {
        console.error('Erro ao criar usuário', error.response ? error.response.data : error.message);
        return res.status(500).send({
            message: "Erro ao criar usuário",
            error: error.response ? error.response.data : error.message
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

async function updateProfile(req, res) {
    try {
        const { bio, username } = req.body; // Removed profilePictureUrl
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const updateData = {
            bio: bio !== undefined ? bio : user.bio,
        };

        // Handle username update
        if (username) {
            const newUsername = slugify(username);
            if (newUsername !== user.username) {
                const existingUser = await User.findOne({ where: { username: newUsername } });
                if (existingUser) {
                    return res.status(409).json({ message: "Este nome de usuário já está em uso. Por favor, escolha outro." });
                }
                updateData.username = newUsername;
            }
        }

        await user.update(updateData);

        return res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao atualizar perfil", error);
        return res.status(500).json({ message: "Erro ao atualizar perfil.", error: error.message });
    }
}

module.exports = {
    CreateUser,
    GetUsers,
    updateProfile
};
