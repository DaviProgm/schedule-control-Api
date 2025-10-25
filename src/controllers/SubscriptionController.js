const axios = require("axios");
const { Subscription, User } = require("../models");

const ASAAS_API = process.env.ASAAS_API_URL;
const ASAAS_TOKEN = process.env.ASAAS_TOKEN;

exports.createSubscription = async (req, res) => {
  // Only owners or users without an owner can create a subscription.
  if (req.user.ownerId) {
    return res.status(403).json({ error: "Profissionais não podem criar assinaturas. Apenas o dono do negócio pode." });
  }

  const userId = req.user.id; // Always use the logged-in user's ID
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ error: "O 'plan' é obrigatório" });
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
    // The user to check is the owner if it exists, otherwise it's the user themselves.
    const userIdToCheck = req.user.ownerId || req.user.id;

    const subscription = await Subscription.findOne({ where: { userId: userIdToCheck } });

    if (!subscription) {
      return res.status(404).json({ message: "Nenhuma assinatura encontrada." });
    }

    let responseData = { subscription };

    // Se a assinatura estiver pendente, busca a invoiceUrl da cobrança
    if (subscription.status === 'pendente') {
      const paymentsResponse = await axios.get(
        `${ASAAS_API}/subscriptions/${subscription.asaasSubscriptionId}/payments`,
        { headers: { 'access_token': ASAAS_TOKEN } }
      );
      const pendingPayment = paymentsResponse.data.data.find(p => p.status === 'PENDING' || p.status === 'OVERDUE');
      if (pendingPayment) {
        responseData.invoiceUrl = pendingPayment.invoiceUrl;
      }
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    res.status(500).json({ error: "Erro ao buscar assinatura" });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    // The user to check is the owner if it exists, otherwise it's the user themselves.
    const userIdToCheck = req.user.ownerId || req.user.id;
    const subscription = await Subscription.findOne({ where: { userId: userIdToCheck } });

    if (!subscription) {
      return res.status(404).json({ message: "Nenhuma assinatura encontrada para cancelar." });
    }

    // Cancel subscription on Asaas
    await axios.delete(`${ASAAS_API}/subscriptions/${subscription.asaasSubscriptionId}`, {
      headers: { 'access_token': ASAAS_TOKEN },
    });

    // Update local status
    await subscription.update({ status: 'canceled' });

    res.status(200).json({ message: "Assinatura cancelada com sucesso.", subscription });

  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao cancelar assinatura" });
  }
};
