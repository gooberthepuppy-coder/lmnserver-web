const axios = require('axios');
const Busboy = require('busboy');
const FormData = require('form-data');

exports.handler = async (event) => {
    return new Promise((resolve) => {
        const busboy = Busboy({ headers: event.headers });
        const fields = {};
        const fileData = {};

        busboy.on('file', (fieldname, file, info) => {
            const chunks = [];
            file.on('data', (data) => chunks.push(data));
            file.on('end', () => {
                fileData.buffer = Buffer.concat(chunks);
                fileData.filename = info.filename;
                fileData.mimeType = info.mimeType;
            });
        });

        busboy.on('field', (fieldname, value) => { fields[fieldname] = value; });

        busboy.on('finish', async () => {
            const form = new FormData();
            form.append('payload_json', JSON.stringify({
                content: `New Skin Submission from ${fields.discord}`,
                embeds: [{ title: "Skin Metadata", description: fields.meta }]
            }));
            form.append('file', fileData.buffer, { filename: fileData.filename, contentType: fileData.mimeType });

            try {
                const WEBHOOK_URL = "https://ptb.discord.com/api/webhooks/1515481926536921282/CArEi5bLYgwa0GkV30SDc8lu3eb_GoutLdI0Bh1s8SMGEjHo95vPhtqNTpeZS4BaQajR";
                await axios.post(WEBHOOK_URL, form, {
                    headers: form.getHeaders()
                });
                resolve({ statusCode: 200, body: "Success" });
            } catch (err) {
                resolve({ statusCode: 500, body: "Failed to send to Discord" });
            }
        });

        busboy.write(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'binary'));
        busboy.end();
    });
};