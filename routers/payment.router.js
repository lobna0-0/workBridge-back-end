const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMW } = require('../middleWare/auth.middleware');
const { allowRoles } = require('../middleWare/role.middleware');

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.stripeWebhook
);

router.post('/create-intent',
    authMW,
    allowRoles('client'),
    paymentController.createPaymentIntent
);

router.get('/client/:id',
    authMW,
    paymentController.getPaymentsByClient
);

router.get('/freelancer/:id',
    authMW,
    paymentController.getPaymentsByFreelancer
);

router.get('/',

    paymentController.getAllPayments
);

router.patch('/:id/confirm',
    authMW,
    allowRoles('client'),
    paymentController.confirmPayment
);

router.get('/:id',
    authMW,
    paymentController.getPayment
);

router.delete('/:id',
    authMW,
    allowRoles('admin'),
    paymentController.deletePayment
);


module.exports = router