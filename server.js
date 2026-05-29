const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const http = require('http');
const { initSocket } = require('./socket');
const { errorHandler } = require('./middleWare/error.middleware');
require('dotenv').config();

const routes = require('./routers/index.router');

const app = express(); 
const port = process.env.PORT || 3000;

// // ================= SECURITY =================
// app.use(helmet());
// app.use(xss());

// // ================= RATE LIMIT =================
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100
// });
// app.use(limiter);

// ================= MIDDLEWARE =================
app.use('/api/payments/webhook',
    express.raw({ type: 'application/json' })
);
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use('/api', routes);

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= FALLBACK ROUTE =================
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ================= CREATE SERVER =================
const server = http.createServer(app);


// init socket
const io = initSocket(server);
// ================= START SERVER =================
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
