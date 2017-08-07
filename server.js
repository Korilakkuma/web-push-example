'use strict';

const webpush    = require('web-push');
const express    = require('express');
const bodyParser = require('body-parser');
const app        = express();

const contact   = 'mailto:rilakkuma.san.xjapan@gmail.com';
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(contact, vapidKeys.publicKey, vapidKeys.privateKey);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port} ...`);
});

app.get('/api/webpush/get', (req, res) => {
    return res.json({
        publicKey: vapidKeys.publicKey
    });
});

app.post('/api/webpush/subscribe', (req, res) => {
    const subscription = {
        endpoint: req.body['hidden-endpoint'],
        keys    : {
            auth  : req.body['hidden-auth'],
            p256dh: req.body['hidden-p256dh']
        }
    };

    const payload = JSON.stringify({
        title: req.body['text-title'],
        body : req.body['text-body'],
        icon : req.body['url-icon'],
        url  : req.body['url-link']
    });

    webpush.sendNotification(subscription, payload).then((response) => {
        return res.json({
            statusCode: response.statusCode || -1,
            message   : response.message    || ''
        });
    }).catch((error) => {
        console.dir(error);
        return res.json({
            statusCode: error.statusCode || -1,
            message   : error.message    || '',
        });
    });
});
