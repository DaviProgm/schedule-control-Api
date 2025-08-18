const axios = require("axios");
const { Subscription } = require("../models/subscription");
const { User } = require("../models/users");

const ASAAS_API = "https://sandbox.asaas.com/api/v3"; // ou produção
const ASAAS_TOKEN = "SUA_CHAVE_API";

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

    const value = plan === "pro" ? 99.90 : 49.90;

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
        headers: { Authorization: `Bearer ${ASAAS_TOKEN}` },
      }
    );

    const subscription = await Subscription.create({
      userId: user.id,
      asaasSubscriptionId: response.data.id,
      plan,
      status: "pending",
    });

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Erro ao criar assinatura:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao criar assinatura" });
  }
};
