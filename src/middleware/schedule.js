const {Schedule} = require('../models/schedule')



async function ValidadeCreateSchedule(req,res,next){
    if(!req.body.name || !req.body.service || !req.body.date || !req.body.time || !req.body.observations ){
        return res.status(400).send({
            message: "Todos os campos são obrigatorios"
        });
        }

        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(req.body.date)) {
        return res.status(400).send({
            message: "Data inválida. Use o formato DD-MM-YYYY."
        });
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(req.body.time)) {
        return res.status(400).send({
            message: "Hora inválida. Use o formato HH:MM."
        });
        }
    }
}
module.exports = {
    ValidadeCreateSchedule
}