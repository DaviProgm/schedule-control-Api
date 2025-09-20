const { Service } = require('../models');

// Create a new service
const createService = async (req, res) => {
  try {
    const { name, duration, price } = req.body;
    const userId = req.user.id;

    const newService = await Service.create({
      name,
      duration,
      price,
      userId,
    });

    res.status(201).json(newService);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: 'Erro ao criar serviço.' });
  }
};

// Get all services for the logged-in user
const getAllServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const services = await Service.findAll({ where: { userId } });
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: 'Erro ao buscar serviços.' });
  }
};

// Get a single service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const service = await Service.findOne({ where: { id, userId } });

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }

    res.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: 'Erro ao buscar serviço.' });
  }
};

// Update a service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price } = req.body;
    const userId = req.user.id;

    const service = await Service.findOne({ where: { id, userId } });

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }

    await service.update({ name, duration, price });

    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: 'Erro ao atualizar serviço.' });
  }
};

// Delete a service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const service = await Service.findOne({ where: { id, userId } });

    if (!service) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }

    await service.destroy();

    res.json({ message: 'Serviço excluído com sucesso.' });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: 'Erro ao excluir serviço.' });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
