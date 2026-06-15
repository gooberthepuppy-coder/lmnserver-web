const axios = require('axios');

exports.handler = async (event) => {
    // 1. Get the Webhook URL from your Netlify Environment Variables
    const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    try {
        // We forward the entire body (the file and text) to Discord
        await axios.post(WEBHOOK_URL, event.body, {
            headers: {
                'Content-Type': event.headers['content-type']
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Skin uploaded successfully!" })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to upload to Discord." })
        };
    }
};