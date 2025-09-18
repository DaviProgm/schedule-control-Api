const { User } = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { Sequelize } = require('sequelize');
require('dotenv').config();


async function Login(req, res) {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);
        console.log('Password from request:', password);
        const user = await User.findOne({ where: { email } });
        console.log('User found from DB:', user ? user.toJSON() : null);
        if (!user) {
            return res.status(404).send({
                message: "Usuario não encontrado!"
            })
        };
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) {
            return res.status(401).send({
                message: "Senha incorreta!"
            })
        };
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
        return res.status(200).send({
            message: "login realizado com sucesso",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('DETAILED LOGIN ERROR:', error)
        return res.status(500).send({
            message: "Erro ao fazer login",
            error: error.message
        })
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: "Usuário não encontrado!" });
        }

        const token = crypto.randomBytes(20).toString('hex');

        await user.update({
            passwordResetToken: token,
            passwordResetExpires: Date.now() + 3600000, // 1 hour
        });

        const msg = {
            to: user.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'Recuperação de Senha',
            text: `Você está recebendo este e-mail porque você (ou outra pessoa) solicitou a recuperação da senha da sua conta.\n\n` +
                `Por favor, clique no link a seguir, ou cole no seu navegador para completar o processo:\n\n` +
                `http://${req.headers.host}/reset/${token}\n\n` +
                `Se você não solicitou isso, por favor, ignore este e-mail e sua senha permanecerá inalterada.\n`
        };

        await sgMail.send(msg);

        res.status(200).send({ message: 'Um e-mail foi enviado para ' + user.email + ' com mais instruções.' });
    } catch (error) {
        console.error('FORGOT PASSWORD ERROR:', error);
        res.status(500).send({ message: 'Erro ao enviar e-mail de recuperação de senha.' });
    }
}

async function resetPassword(req, res) {
    try {
        const user = await User.findOne({
            where: {
                passwordResetToken: req.params.token,
                passwordResetExpires: { [Sequelize.Op.gt]: Date.now() },
            },
        });

        if (!user) {
            return res.status(400).send({ message: 'Token de recuperação de senha inválido ou expirado.' });
        }

        const { password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        await user.update({
            password: hashPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
        });

        const msg = {
            to: user.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            subject: 'Sua senha foi alterada',
            text: `Olá,\n\n` +
                `Esta é uma confirmação de que a senha para sua conta ${user.email} foi alterada com sucesso.\n`
        };

        await sgMail.send(msg);

        res.status(200).send({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        console.error('RESET PASSWORD ERROR:', error);
        res.status(500).send({ message: 'Erro ao resetar a senha.' });
    }
}


module.exports = {
    Login,
    forgotPassword,
    resetPassword
}