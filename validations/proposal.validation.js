const joi = require('joi');

exports.proposaltSchema = joi.object({
    project_id: joi.number().required(),
    cover_letter: joi.string().min(10).required(),
    bid_amount: joi.number().positive().required(),
    delivery_time: joi.number().positive().required()
})