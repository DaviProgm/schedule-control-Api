const { Unit, User, Service, UserUnit, ServiceUnit } = require('../models');
const { Op } = require('sequelize');

// Criar uma nova unidade
const createUnit = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    const ownerId = req.user.id; // Get owner's ID from authenticated user
    const unit = await Unit.create({ name, address, phone, ownerId });
    res.status(201).json(unit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Erro ao criar unidade.' });
  }
};

// Obter todas as unidades do dono logado
const getAllUnits = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const units = await Unit.findAll({ where: { ownerId } });
    res.status(200).json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Erro ao buscar unidades.' });
  }
};

// Obter uma unidade por ID
const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const unit = await Unit.findOne({
      where: { id, ownerId },
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'username'],
          through: { attributes: [] }
        },
        {
          model: Service,
          as: 'services',
          attributes: ['id', 'name', 'price', 'duration'],
          through: { attributes: [] }
        }
      ]
    });
    if (!unit) {
      return res.status(404).json({ message: 'Unidade não encontrada ou não pertence a você.' });
    }
    res.status(200).json(unit);
  } catch (error) {
    console.error('Error fetching unit by ID:', error);
    res.status(500).json({ message: 'Erro ao buscar unidade.' });
  }
};

// Atualizar uma unidade
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const { name, address, phone } = req.body;
    const [updated] = await Unit.update({ name, address, phone }, {
      where: { id, ownerId }
    });
    if (updated) {
      const updatedUnit = await Unit.findByPk(id);
      return res.status(200).json(updatedUnit);
    }
    return res.status(404).json({ message: 'Unidade não encontrada ou não pertence a você.' });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Erro ao atualizar unidade.' });
  }
};

// Excluir uma unidade
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    const deleted = await Unit.destroy({
      where: { id, ownerId }
    });
    if (deleted) {
      return res.status(204).send("Unidade excluída com sucesso.");
    }
    return res.status(404).json({ message: 'Unidade não encontrada ou não pertence a você.' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Erro ao excluir unidade.' });
  }
};

// Associar um provedor a uma unidade
const addProviderToUnit = async (req, res) => {
  try {
    const { unitId, userId } = req.params;
    const ownerId = req.user.id;

    // Verify the unit belongs to the owner
    const unit = await Unit.findOne({ where: { id: unitId, ownerId } });
    if (!unit) {
        return res.status(404).json({ message: 'Unidade não encontrada ou não pertence a você.' });
    }

    // Verify the professional being added is owned by the same owner
    const user = await User.findOne({ where: { id: userId, ownerId } });
    if (!user) {
      return res.status(404).json({ message: 'Profissional não encontrado ou não pertence ao seu negócio.' });
    }

    await unit.addUser(user);
    res.status(200).json({ message: 'Profissional associado à unidade com sucesso.' });
  } catch (error) {
    console.error('Error adding provider to unit:', error);
    res.status(500).json({ message: 'Erro ao associar provedor à unidade.' });
  }
};

// Desassociar um provedor de uma unidade
const removeProviderFromUnit = async (req, res) => {
  try {
    const { unitId, userId } = req.params;
    const ownerId = req.user.id;

    const unit = await Unit.findOne({ where: { id: unitId, ownerId } });
    if (!unit) {
        return res.status(404).json({ message: 'Unidade não encontrada ou não pertence a você.' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Profissional não encontrado.' });
    }

    await unit.removeUser(user);
    res.status(200).json({ message: 'Provedor desassociado da unidade com sucesso.' });
  } catch (error) {
    console.error('Error removing provider from unit:', error);
    res.status(500).json({ message: 'Erro ao desassociar provedor da unidade.' });
  }
};

// Associar um serviço a uma unidade
const addServiceToUnit = async (req, res) => {
  try {
    const { unitId, serviceId } = req.params;
    const ownerId = req.user.id;

    const unit = await Unit.findOne({ where: { id: unitId, ownerId } });
    if (!unit) {
        return res.status(404).json({ message: 'Unidade não encontrada ou não pertence a você.' });
    }

    // Verify the service belongs to a provider within the owner's business
    const service = await Service.findByPk(serviceId, { include: { model: User, as: 'user', where: { ownerId } } });
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado ou não pertence a um profissional do seu negócio.' });
    }

    await unit.addService(service);
    res.status(200).json({ message: 'Serviço associado à unidade com sucesso.' });
  } catch (error) {
    console.error('Error adding service to unit:', error);
    res.status(500).json({ message: 'Erro ao associar serviço à unidade.' });
  }
};

// Desassociar um serviço de uma unidade
const removeServiceFromUnit = async (req, res) => {
  try {
    const { unitId, serviceId } = req.params;
    const ownerId = req.user.id;

    const unit = await Unit.findOne({ where: { id: unitId, ownerId } });
    if (!unit) {
        return res.status(404).json({ message: 'Unidade não encontrada ou não pertence a você.' });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }

    await unit.removeService(service);
    res.status(200).json({ message: 'Serviço desassociado da unidade com sucesso.' });
  } catch (error) {
    console.error('Error removing service from unit:', error);
    res.status(500).json({ message: 'Erro ao desassociar serviço da unidade.' });
  }
};


module.exports = {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  addProviderToUnit,
  removeProviderFromUnit,
  addServiceToUnit,
  removeServiceFromUnit,
};