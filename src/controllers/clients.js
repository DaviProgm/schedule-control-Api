const { Client } = require('../models');


async function CreateClient(req, res) {
    const { name, email, phone, address } = req.body;
    try {
        const client = await Client.create({
            name,
            email,
            phone,
            address,
            userId: req.user.id
        });
        return res.status(201).json({
            message: 'Cliente criado com sucesso!',
            client
        });


    } catch (error) {
        console.error("Erro ao criar cliente", error);
        return res.status(500).send({
            message: 'Erro ao criar cliente',
            error: error.message
        });
    }

}
async function GetClients(req, res) {
    try {
        const clients = await Client.findAll({
            where: { userId: req.user.id },
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
        const { id } = req.params;
        const { name, email, phone, address } = req.body;

        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).send({ message: "Cliente não encontrado" });
        }
        await client.update({ name, email, phone, address });

        return res.status(200).json({
            message: 'Cliente atualizado com sucesso!',
            client
        });
    } catch (error) {
        console.error("Erro ao atualizar cliente", error);
        return res.status(500).send({
            message: 'Erro ao atualizar cliente',
            error: error.message
        });
    }
}
async function DeleteClient(req, res) {
    try {
        const { id } = req.params;

        const client = await Client.findByPk(id);
        if (!client) {
            return res.status(404).send({ message: "Cliente não encontrado" });
        }
        await client.destroy();

        return res.status(200).json({
            message: 'Cliente deletado com sucesso!'
        });
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
    DeleteClient
};