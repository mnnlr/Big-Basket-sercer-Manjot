

const express = require('express');
const cors = require('cors')
const { Order } = require('../db');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config()

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const getRawBody = require("raw-body")
const bodyparser = require("body-parser")

const paymentRouter = express.Router();
// paymentRouter.use(express.raw({ type: 'application/json', verify: (req, res, buf) => {
//     req.rawBody = buf.toString();
// } }));

function generateUniqueOrderId() {
    return uuidv4();
}

paymentRouter.post('/checkout-session', async (req, res) => {
    try {
        const { products, name, email, address, phone   } = req.body;

        const order = await Order.create({
            name,
            email,
            address,
            phone,
         
            orders: products
        });

        const line_items = products.map(product => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.category,
                },
                unit_amount: product.price * 100,
            },
            quantity: product.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'http://localhost:5173/cancel',
            metadata: {
                orderId: order._id.toString() 
            }
        });
        console.log("session :", session);

        res.json({ sessionId: session.id });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


paymentRouter.get('/success', async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const orderId = session.metadata.orderId;

         
            console.log('Retrieved Order ID from metadata:', orderId);

           
            const order = await Order.findOne({ _id: orderId });  
            if (order) {
                order.paymentStatus = 'completed';
                order.paymentTime = new Date();
                await order.save();
                console.log('Order updated:', order);
                res.send('Payment successful! Order status has been updated.');
            } else {
                console.error('Order not found:', orderId);
                res.status(404).send('Order not found.');
            }
        } else {
            res.send('Payment failed or was not completed.');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('Internal Server Error');
    }
});




// paymentRouter.use('/webhook', bodyparser.raw({ type: 'application/json' }),
//     bodyparser.json({
//         verify: (req, res, buf) => {
//             req.rawBody = buf
//         }
//     }));

// paymentRouter.post('/webhook', async (req, res) => {
//     const sig = req.headers['stripe-signature'];

//     console.log("stripe-signature :", typeof sig)

//     console.log('Request Headers:', req.headers);
//     // console.log('Request Body:',  req.body);
//     //    console.log('Type of req.body:', Buffer.isBuffer(req.body) ? 'Buffer' : typeof req.body);

//     //   const rawBody = await req.getRawBody
//     // let  = await req.text()
//     //    const rawBody =  req.rawBody;
//     console.log('Raw Body:', req.rawbody);
//     //    const rawBody = await req.rawbody.getRawBody()
//     const rawBody = req.rawBody
//     let event
//     try {

//         event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);

//         console.log('event :', event);

//         const data = event.data.object;
//         const eventType = event.type;

//         if (eventType === 'checkout.session.completed') {
//             const orderId = data.metadata.orderId;

//             console.log('Session metadata:', data.metadata);
//             console.log('Order ID from metadata:', orderId);


//             const order = await Order.findOne({ id: orderId });
//             if (order) {
//                 order.paymentStatus = 'completed';
//                 await order.save();
//                 console.log('Order updated:', order);
//             } else {
//                 console.error('Order not found:', orderId);
//             }

//         } else {
//             console.log('Unhandled event type:', eventType);
//         }


//         return res.status(200).json({ received: true });

//     } catch (err) {
//         console.error("Webhook Error:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
// });



module.exports = paymentRouter;