const axios = require('axios');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') return { statusCode: 405 };

  try {
    const { discord, meta, skinData } = JSON.parse(event.body);

    // Send the data to the Discord webhook
    const DISCORD_WEBHOOK_URL = "https://ptb.discord.com/api/webhooks/1515481926536921282/CArEi5bLYgwa0GkV30SDc8lu3eb_GoutLdI0Bh1s8SMGEjHo95vPhtqNTpeZS4BaQajR";
    await axios.post(DISCORD_WEBHOOK_URL, {
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