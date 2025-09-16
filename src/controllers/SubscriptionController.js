const axios = require("axios");
const { Subscription, User } = require("../models");

const ASAAS_API = process.env.ASAAS_API_URL;
const ASAAS_TOKEN = process.env.ASAAS_TOKEN;

exports.createSubscription = async (req, res) => {
  const { userId, plan } = req.body;

  if (!userId || !plan) {
    return res.status(400).json({ error: "userId e plan são obrigatórios" });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user || !user.asaasCustomerId) {
      return res.status(404).json({ error: "Usuário não encontrado ou sem customerId do Asaas" });
    }

    const value = plan === "pro" ? 49.99 : 29.99;

    const response = await axios.post(
      `${ASAAS_API}/subscriptions`,
      {
        customer: user.asaasCustomerId,
        billingType: "PIX",
        value,
        cycle: "MONTHLY",
        nextDueDate: new Date().toISOString().split("T")[0], // hoje
        description: `Plano ${plan} - SaaS Agenda`,
      },
      {
        headers: { 'access_token': ASAAS_TOKEN },
      }
    );

    const asaasSubscription = response.data;

    // Fetch the first payment details from Asaas
    const paymentsResponse = await axios.get(
      `${ASAAS_API}/subscriptions/${asaasSubscription.id}/payments`,
      { headers: { 'access_token': ASAAS_TOKEN } }
    );

    const firstPayment = paymentsResponse.data.data[0];

    const localSubscription = await Subscription.create({
      userId: user.id,
      asaasSubscriptionId: asaasSubscription.id,
      plan,
      status: "pendente",
    });

    res.status(200).json({ 
      version: 2,
      code_is_updated: true,
      subscription: localSubscription,
      paymentInfo: firstPayment 
    });
  } catch (error) {
    console.error("Erro ao criar assinatura:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao criar assinatura" });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ where: { userId: req.user.id } });

    if (!subscription) {
      return res.status(404).json({ message: "Nenhuma assinatura encontrada." });
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    res.status(500).json({ error: "Erro ao buscar assinatura" });
  }
};
