require('dotenv').config();

const express = require('express');
const instagramWebhook = require('./instagramWebhook');

const app = express();
const PORT = process.env.PORT || 3000;


/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

// Parse JSON bodies
app.use(express.json());

// Parse URL encoded bodies (important for Meta)
app.use(express.urlencoded({ extended: true }));


/*
|--------------------------------------------------------------------------
| Root Route (Browser Test)
|--------------------------------------------------------------------------
*/

app.get('/', (req, res) => {
    res.send('Instagram Webhook Server Running 🚀');
});


/*
|--------------------------------------------------------------------------
| Webhook Route
|--------------------------------------------------------------------------
*/

app.use('/webhook/instagram', instagramWebhook);


/*
|--------------------------------------------------------------------------
| Health Check Endpoint
|--------------------------------------------------------------------------
*/

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).send('Internal Server Error');
});


/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

function startServer() {
    const server = app.listen(PORT, async () => {
        console.log('----------------------------------');
        console.log(`🚀 Instagram Server running on port ${PORT}`);
        console.log(`📡 Webhook endpoint: /webhook/instagram`);
        console.log('----------------------------------');

        // Check if ngrok configuration is provided
        const authtoken = process.env.NGROK_AUTHTOKEN;
        const domain = process.env.NGROK_DOMAIN;

        if (authtoken && domain) {
            try {
                console.log('🔄 Starting secure ngrok tunnel...');
                const ngrok = require('@ngrok/ngrok');
                const listener = await ngrok.forward({
                    addr: PORT,
                    authtoken: authtoken,
                    domain: domain
                });
                console.log(`🌐 Secure Tunnel established!`);
                console.log(`🔗 Callback URL: ${listener.url()}/webhook/instagram`);
                console.log('----------------------------------');
            } catch (err) {
                console.error('❌ Failed to start ngrok tunnel:', err.message);
            }
        }
    });
    return server;
}

module.exports = { startServer, app };