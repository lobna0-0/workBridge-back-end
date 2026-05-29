const joi = require('joi');

exports.paymentSchema = joi
  .object({
    project_id: joi.number().required(),
    client_id: joi.number().required(),
    freelancer_id: joi.number().required(),
    amount: joi.number().positive().required()
  })
  // frontend sends extra fields (e.g. stripe_payment_intent/status). Don't block the request.
  .unknown(true);
