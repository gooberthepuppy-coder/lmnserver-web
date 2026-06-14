const busboy = require('busboy');
const axios = require('axios');
const FormData = require('form-data');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { discord, meta, skinBuffer, skinFilename } = await parseMultipart(event);

    const form = new FormData();
    form.append('payload_json', JSON.stringify({
      embeds: [{
        title: 'New Skin Submission',
        fields: [
          { name: 'Discord', value: discord || 'N/A', inline: true },
          { name: 'Meta', value: meta || 'N/A', inline: true },
        ],
        image: { url: 'attachment://skin.png' },
      }],
    }));

    if (skinBuffer) {
      form.append('files[0]', skinBuffer, {
        filename: skinFilename || 'skin.png',
        contentType: 'image/png',
      });
    }

    await axios.post(process.env.DISCORD_WEBHOOK_URL, form, {
      headers: form.getHeaders(),
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Success' }) };
  } catch (error) {
    console.error('submit error:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send' }) };
  }
};

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: { 'content-type': event.headers['content-type'] } });
    const fields = {};
    let skinBuffer = null;
    let skinFilename = 'skin.png';

    bb.on('file', (_name, file, info) => {
      skinFilename = info.filename || 'skin.png';
      const chunks = [];
      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => { skinBuffer = Buffer.concat(chunks); });
    });

    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('close', () => resolve({ ...fields, skinBuffer, skinFilename }));
    bb.on('error', reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body, 'binary');

    bb.write(body);
    bb.end();
  });
}
