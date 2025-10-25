const { Client } = require('../models');
const supabase = require('../config/supabase');

// All functions in this controller are for owners managing their clients.

async function UploadProfilePicture(req, res) {
    try {
        const { id } = req.params; // client ID
        const ownerId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).send({ message: "Nenhum arquivo enviado." });
        }

        // Verify client exists and belongs to the owner
        const client = await Client.findOne({ where: { id, ownerId } });
        if (!client) {
            return res.status(404).send({ message: "Cliente não encontrado ou não pertence a este negócio." });
        }

        const fileName = `profile-pictures/${id}-${Date.now()}`;
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

        await client.update({ foto_perfil_url: publicUrl });

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

async function CreateClient(req, res) {
    const { name, email, phone, address } = req.body;
    const ownerId = req.user.id; // The logged-in user is the owner
    try {
        const client = await Client.create({
            name,
            email,
            phone,
            address,
            ownerId: ownerId 
        });
        return res.status(201).json({
            message: 'Cliente criado com sucesso!',
            client
        });
    } catch (error) {
        // Handle unique constraint error gracefully
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({ message: 'Um cliente com este email já existe neste negócio.' });
        }
        console.error("Erro ao criar cliente", error);
        return res.status(500).send({
            message: 'Erro ao criar cliente',
            error: error.message
        });
    }
}

async function GetClients(req, res) {
    try {
        const ownerId = req.user.id;
        const clients = await Client.findAll({
            where: { ownerId: ownerId },
            order: [['name', 'ASC']],
        });
        return res.status(200).json(clients);
    } catch (error) {
        console.error("Erro ao buscar clientes", error);
        return res.status(500).send({
            message: 'Erro ao buscar clientes',
            error: error.message
        });
    }
}

async function UpdateClient(req, res) {
    try {
        const { id } = req.params; // client ID
        const ownerId = req.user.id;
        const { name, email, phone, address } = req.body;

        const [updated] = await Client.update({ name, email, phone, address }, {
            where: { id, ownerId }
        });

        if (updated) {
            const updatedClient = await Client.findByPk(id);
            return res.status(200).json({
                message: 'Cliente atualizado com sucesso!',
                client: updatedClient
            });
        }
        
        return res.status(404).send({ message: "Cliente não encontrado ou não pertence a este negócio." });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({ message: 'Um cliente com este email já existe neste negócio.' });
        }
        console.error("Erro ao atualizar cliente", error);
        return res.status(500).send({
            message: 'Erro ao atualizar cliente',
            error: error.message
        });
    }
}

async function DeleteClient(req, res) {
    try {
        const { id } = req.params; // client ID
        const ownerId = req.user.id;

        const deleted = await Client.destroy({
            where: { id, ownerId }
        });

        if (deleted) {
            return res.status(200).json({
                message: 'Cliente deletado com sucesso!'
            });
        }

        return res.status(404).send({ message: "Cliente não encontrado ou não pertence a este negócio." });

    } catch (error) {
        console.error("Erro ao deletar cliente", error);
        return res.status(500).send({
            message: 'Erro ao deletar cliente',
            error: error.message
        });
    }
}

module.exports = {
    CreateClient,
    GetClients,
    UpdateClient,
    DeleteClient,
    UploadProfilePicture
};