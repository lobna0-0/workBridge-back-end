const joi = require('joi');

exports.reportSchema = joi.object({
    eporter_id: joi.number().required(),
    reported_user_id: joi.number().required(),
    project_id: joi.number().optional().allow(null),
    reason: joi.string().min(10).required(),
    status: joi.string().valid('pending', 'resolved', 'ignored').optional()
})