require("dotenv").config();
const bcrypt = require('bcrypt');

const {User} = require('../models/users')

async function CreateUser(req,res){
    try {
        const {name, email, password} = req.body;
        const hashPassword = await bcrypt.hash(password,10);
        const user = await User.create({name, email, password: hashPassword});


        return res.status(201).send(user);
    } catch (error) {
        console.error('Erro ao criar usuario', error)
        return res.status(500).send({
            message:"Erro ao criar usuario",
            error:error.message
        })
    }
}
module.exports={
    CreateUser
}