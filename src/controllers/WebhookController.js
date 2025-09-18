const { Subscription, Payment } = require('../models');

exports.handleAsaasWebhook = async (req, res) => {
    const { event, payment } = req.body;

    if (!event || !payment) {
        return res.status(400).send('Requisição inválida');
    }

    try {
        const subscription = await Subscription.findOne({ where: { asaasSubscriptionId: payment.subscription } });

        if (!subscription) {
            return res.status(404).send('Assinatura não encontrada');
        }

        let paymentRecord = await Payment.findOne({ where: { asaasPaymentId: payment.id } });

        if (!paymentRecord) {
            paymentRecord = await Payment.create({
                asaasPaymentId: payment.id,
                subscriptionId: subscription.id,
                value: payment.value,
                dueDate: payment.dueDate,
                status: 'pendente',
            });
        }

        let newStatus = subscription.status;
        let paymentStatus = paymentRecord.status;

        switch (event) {
            case 'PAYMENT_CONFIRMED':
            case 'PAYMENT_RECEIVED':
                newStatus = 'ativo';
                paymentStatus = 'confirmado';
                break;
            case 'PAYMENT_OVERDUE':
                newStatus = 'overdue';
                paymentStatus = 'atrasado';
                break;
            case 'PAYMENT_DELETED':
            case 'PAYMENT_CANCELLED':
                newStatus = 'canceled';
                paymentStatus = 'cancelado';
                break;
        }

        await subscription.update({ status: newStatus });
        await paymentRecord.update({ status: paymentStatus, paymentDate: new Date() });

        res.status(200).send('Webhook recebido com sucesso');
    } catch (error) {
        console.error('Erro ao processar webhook do Asaas:', error);
        res.status(500).send('Erro interno ao processar o webhook');
    }
};