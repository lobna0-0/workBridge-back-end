const joi = require('joi');

exports.messageSchema = joi.object({
    project_id: joi.number().required(),
    sender_id: joi.number().required(),
    content: joi.string().min(1).required()
})