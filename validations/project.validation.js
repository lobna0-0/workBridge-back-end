const joi = require('joi');

exports.projectSchema = joi.object({
    client_id: joi.number().required(),
    title: joi.string().min(3).required(),
    description: joi.string().allow(''), // optional
    budget: joi.number().positive().required(),
    deadline: joi.date().required()
})