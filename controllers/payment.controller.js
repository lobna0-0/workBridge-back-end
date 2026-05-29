const Stripe = require('stripe');
const supabase = require('../config/supabase');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment.model');
const { sendNotification } = require('../service/notifications.service');
const { paymentSchema } = require('../validations/payment.validation');

//  Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { error } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { project_id, client_id, freelancer_id, amount } = req.body;
    const platformFeePercent = 10;

    const platformFee =
      (amount * platformFeePercent) / 100;

    const freelancerAmount =
      amount - platformFee;

    // 1. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: {
        project_id: String(project_id),
        client_id: String(client_id),
        freelancer_id: String(freelancer_id),
      },
    });

    // 2. Save payment in DB
    const payment = await Payment.createPayment({
  project_id: Number(project_id),
  client_id: Number(client_id),
  freelancer_id: Number(freelancer_id),

  amount: Number(amount),

  platform_fee: platformFee,

  freelancer_amount: freelancerAmount,

  status: "pending",

  stripe_payment_intent: paymentIntent.id,
});

    console.log("PAYMENT CREATED:", payment);

    console.log("PAYLOAD:", {
      project_id,
      client_id,
      freelancer_id,
      amount,
    });

    return res.status(200).json({
      message: "Payment intent created",
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });

  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
//  Stripe Webhook — fires automatically when payment succeeds 
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, // must be raw buffer — see router note below
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;

        const payment = await Payment.getPaymentByStripeId(intent.id);
        if (payment) {
            await Payment.completePayment(payment.id, { status: 'paid' });

            // notify client
            await sendNotification(payment.client_id, {
              title: "Payment Successful",
              message: "Your payment has been completed",
              redirect_url: `/client/payment/${payment.project_id}`,
              type: "payment",
              event_key: `payment_completed:${payment.id}:user:${payment.client_id}`
          });

          await sendNotification(payment.freelancer_id, {
              title: "Payment Received",
              message: "The client has paid for your work!",
              redirect_url: `/client/payment/${payment.project_id}`,
              type: "payment",
              event_key: `payment_received:${payment.id}:user:${payment.freelancer_id}`
          });
        }
    }

    res.json({ received: true });
};

//  Get one payment
exports.getPayment = async (req, res) => {
  try {

    const payment = await Payment.getPaymentById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });

  } catch (err) {

    console.error('GET PAYMENT ERROR:', err);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Confirm payment (manual client confirmation after Stripe success)
exports.confirmPayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.client_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized for this payment" });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ error: "Payment already confirmed" });
    }

    // Optional: Capture Stripe payment if requires_action
    if (payment.stripe_payment_intent) {
      await stripe.paymentIntents.retrieve(payment.stripe_payment_intent);
    }

    // We don’t persist `stripe_status` in the current DB schema (payments table).
    // Webhook already marks the payment as paid when Stripe succeeds.
    const updated = await Payment.completePayment(paymentId, {
      status: 'paid',
      paid_at: new Date().toISOString()
    });

    // Send notifications
    const { sendNotification } = require('../service/notifications.service');
    await sendNotification(payment.client_id, {
  title: "Payment Successful",
  message: "Your payment has been completed",
  type: "payment",
  project_id: payment.project_id,
  redirect_url: `/client/payments`,
  event_key: `payment_completed:${payment.id}:user:${payment.client_id}`
});

await sendNotification(payment.freelancer_id, {
  title: "Payment Received",
  message: "The client has paid for your work!",
  type: "payment",
  project_id: payment.project_id,
  redirect_url: `/freelancer/earnings`,
  event_key: `payment_received:${payment.id}:user:${payment.freelancer_id}`
});

    res.json({ 
      success: true, 
      message: "Payment confirmed successfully",
      payment: updated 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Get all (admin)
// GET ALL (admin) - now uses model with joins
exports.getAllPayments = async (req, res) => {
  try {
    const result = await Payment.getAllPayments();

    res.json({
      data: result
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};
// GET BY CLIENT - now uses model with joins/pagination
exports.getPaymentsByClient = async (req, res) => {
  try {
    const clientId = req.params.id;

    if (clientId != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const data = await Payment.getPaymentsByClient(clientId);

    res.json({
      data
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

// GET BY FREELANCER - now uses model with joins/pagination
exports.getPaymentsByFreelancer = async (req, res) => {
  try {
    const freelancerId = req.params.id;
    if (freelancerId != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await Payment.getPaymentsByFreelancer(freelancerId, page, limit);

    res.json({
      data,
      pagination: { page, limit }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//  Delete (admin)
exports.deletePayment = async (req, res) => {
    try {
        const payment = await Payment.getPaymentById(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });
        if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

        const deleted = await Payment.deletePayment(req.params.id);
        res.status(200).json({ message: "Deleted", deleted });
    } catch (err) {
        res.status(500).json({ error: err.message }); //  was using undeclared `error`
    }
};
