require("dotenv").config();
const axios = require('axios');
const bcrypt = require('bcrypt');
const { User, WorkHour } = require('../models');
const supabase = require('../config/supabase');

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

async function RegisterOwner(req, res) {
    try {
        const { name, email, password, cpfCnpj } = req.body;

        const hashPassword = await bcrypt.hash(password, 10);
        // Owners are created with role 'owner' and null ownerId
        const user = await User.create({ name, email, password: hashPassword, role: 'owner', ownerId: null });

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

        // --- Add default work hours for the new user ---
        const defaultWorkHours = [
            { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isAvailable: false, userId: user.id }, // Sunday
            { dayOfWeek: 1, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },  // Monday
            { dayOfWeek: 2, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },  // Tuesday
            { dayOfWeek: 3, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },  // Wednesday
            { dayOfWeek: 4, startTime: "07:00", "endTime": "19:00", isAvailable: true, userId: user.id },  // Thursday
            { dayOfWeek: 5, startTime: "07:00", "endTime": "19:00", isAvailable: true, userId: user.id },  // Friday
            { dayOfWeek: 6, startTime: "00:00", "endTime": "00:00", isAvailable: false, userId: user.id }   // Saturday
        ];
        await WorkHour.bulkCreate(defaultWorkHours);
        // --- End default work hours ---

        await user.reload();

        return res.status(201).send(user);
    } catch (error) {
        console.error('Erro ao registrar dono', error.response ? error.response.data : error.message);
        return res.status(500).send({
            message: "Erro ao registrar dono",
            error: error.response ? error.response.data : error.message
        });
    }
}

async function createProfessional(req, res) {
    try {
        const { name, email, password } = req.body;
        const ownerId = req.user.id; // The logged-in user is the owner

        // Check if the logged-in user is an owner
        if (req.user.role !== 'owner') {
            return res.status(403).send({ message: "Apenas donos de negócios podem cadastrar profissionais." });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        // Professionals are created with role 'provider' and the owner's ID
        const user = await User.create({ name, email, password: hashPassword, role: 'provider', ownerId: ownerId });

        // Professionals don't need to be customers in Asaas, so we skip that.
        // If they do, that logic would be added here.

        const username = await generateUniqueUsername(name);
        await user.update({ username });

        // --- Add default work hours for the new professional ---
        const defaultWorkHours = [
            { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isAvailable: false, userId: user.id },
            { dayOfWeek: 1, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },
            { dayOfWeek: 2, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },
            { dayOfWeek: 3, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },
            { dayOfWeek: 4, startTime: "07:00", "endTime": "19:00", isAvailable: true, userId: user.id },
            { dayOfWeek: 5, startTime: "07:00", "endTime": "19:00", isAvailable: true, userId: user.id },
            { dayOfWeek: 6, startTime: "00:00", "endTime": "00:00", isAvailable: false, userId: user.id }
        ];
        await WorkHour.bulkCreate(defaultWorkHours);
        
        await user.reload();

        return res.status(201).send(user);
    } catch (error) {
        console.error('Erro ao criar profissional', error.response ? error.response.data : error.message);
        return res.status(500).send({
            message: "Erro ao criar profissional",
            error: error.response ? error.response.data : error.message
        });
    }
}

async function getProfessionalsByOwner(req, res) {
    try {
        const ownerId = req.user.id;
        // Find all users (providers) that belong to the logged-in owner
        const users = await User.findAll({ where: { ownerId: ownerId, role: 'provider' } })
        return res.status(200).json(users);
    } catch (error) {
        console.error("Erro ao buscar profissionais", error);
        return res.status(500).send({
            message: 'Erro ao buscar profissionais',
            error: error.message
        });
    }
}

async function getAllUsers(req, res) {
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
        const { bio, username, cor_perfil } = req.body; // Removed profilePictureUrl
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const updateData = {
            bio: bio !== undefined ? bio : user.bio,
            cor_perfil: cor_perfil !== undefined ? cor_perfil : user.cor_perfil,
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

async function getProfile(req, res) {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'username', 'bio', 'role', 'foto_perfil_url', 'cor_perfil']
        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar perfil", error);
        return res.status(500).json({ message: "Erro ao buscar perfil.", error: error.message });
    }
}

async function uploadProfilePhoto(req, res) {
    try {
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).send({ message: "Nenhum arquivo enviado." });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }

        const fileName = `profile-pictures/${userId}-${Date.now()}`;
        const { data, error } = await supabase.storage
            .from('profile-pictures')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) {
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage.from('profile-pictures').getPublicUrl(fileName);

        await user.update({ foto_perfil_url: publicUrl });

        return res.status(200).json({
            message: 'Foto de perfil atualizada com sucesso!',
            url: publicUrl,
        });
    } catch (error) {
        console.error("Erro ao fazer upload da foto de perfil", error);
        return res.status(500).send({
            message: 'Erro ao fazer upload da foto de perfil',
            error: error.message,
        });
    }
}

async function setDefaultWorkHours(req, res) {
    try {
        const { userId } = req.params; // User ID from URL parameter
        const requestingUserId = req.user.id; // ID of the user making the request

        // Optional: Add authorization check here if only admins or the user themselves can set default hours
        // For now, assuming the requesting user is authorized to do this for the userId in params
        if (parseInt(userId) !== requestingUserId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Acesso negado. Você não tem permissão para definir horários para este usuário." });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Define the default work hours
        const defaultWorkHours = [
            { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isAvailable: false, userId: user.id }, // Sunday
            { dayOfWeek: 1, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },  // Monday
            { dayOfWeek: 2, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },  // Tuesday
            { dayOfWeek: 3, startTime: "07:00", endTime: "19:00", isAvailable: true, userId: user.id },  // Wednesday
            { dayOfWeek: 4, startTime: "07:00", "endTime": "19:00", isAvailable: true, userId: user.id },  // Thursday
            { dayOfWeek: 5, startTime: "07:00", "endTime": "19:00", isAvailable: true, userId: user.id },  // Friday
            { dayOfWeek: 6, startTime: "00:00", "endTime": "00:00", isAvailable: false, userId: user.id }   // Saturday
        ];

        // Delete existing work hours for this user
        await WorkHour.destroy({ where: { userId: user.id } });

        // Bulk create the new default work hours
        await WorkHour.bulkCreate(defaultWorkHours);

        return res.status(200).json({ message: `Horários padrão definidos para o usuário ${user.username}.` });
    } catch (error) {
        console.error("Erro ao definir horários padrão:", error);
        return res.status(500).json({ message: "Erro ao definir horários padrão.", error: error.message });
    }
}

async function uploadProfessionalPhoto(req, res) {
    try {
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).send({ message: "Nenhum arquivo enviado." });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado" });
        }

        // Usar um bucket/pasta diferente para fotos de profissional, se desejar
        const fileName = `professional-pictures/${userId}-${Date.now()}`;
        const { data, error } = await supabase.storage
            .from('professional-pictures') // Pode ser um bucket diferente ou uma pasta dentro do mesmo bucket
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });

        if (error) {
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage.from('professional-pictures').getPublicUrl(fileName);

        await user.update({ professional_photo_url: publicUrl }); // Atualiza o novo campo

        return res.status(200).json({
            message: 'Foto de profissional atualizada com sucesso!',
            url: publicUrl,
        });
    } catch (error) {
        console.error("Erro ao fazer upload da foto de profissional", error);
        return res.status(500).send({
            message: 'Erro ao fazer upload da foto de profissional',
            error: error.message,
        });
    }
}

module.exports = {
    RegisterOwner,
    createProfessional,
    getProfessionalsByOwner,
    getAllUsers,
    updateProfile,
    getProfile,
    setDefaultWorkHours,
    uploadProfilePhoto,
    uploadProfessionalPhoto
};
