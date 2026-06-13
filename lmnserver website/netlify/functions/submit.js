const axios = require('axios');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  try {
    const { discord, meta, skinData } = JSON.parse(event.body);

    // Send the data to your webhook using the environment variable
    // Access this via process.env.DISCORD_WEBHOOK_URL in your Netlify dashboard
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      embeds: [{
        title: "New Skin Submission",
        fields: [
          { name: "Discord", value: discord, inline: true },
          { name: "Meta", value: meta, inline: true }
        ],
        description: "Skin data attached."
      }]
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Success" }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to send" }) };
  }
};