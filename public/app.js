'use strict';

const urlsafeBase64ToBinary = (urlsafeBase64) => {
    const base64 = urlsafeBase64.replace(/-/g, '+').replace(/_/g, '/');

    const raw    = window.atob(base64);
    const binary = new Uint8Array(raw.length);

    for (let i = 0, len = binary.length; i < len; i++) {
        binary[i] = raw.charCodeAt(i);
    }

    return binary;
};

const arrayBufferToBase64 = (arrayBuffer) => {
    const binary = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
};

const subscribeWebPush = () => {
    if (!navigator.serviceWorker) {
        return;
    }

    navigator.serviceWorker.register('./service-worker-web-push.js').then(() => {
        console.log('Registering Service Worker is successful.');
        return navigator.serviceWorker.ready;
    }).catch(() => {
        console.error('Registering Service Worker failed.');
    }).then((registration) => {
        const options = {
            method : 'GET',
            headers: new Headers({ 'Content-Type' : 'application/json' })
        };

        return fetch('/api/webpush/get', options)
            .then((res) => res.json())
            .then((res) => {
                return registration.pushManager.subscribe({
                    userVisibleOnly     : true,
                    applicationServerKey: urlsafeBase64ToBinary(res.publicKey)
                });
            }).catch((error) => {
                console.dir(error);
                console.log('Fetching public key failed.');
            });
    }).then((subscription) => {
        document.getElementById('hidden-endpoint').value = subscription.endpoint;
        document.getElementById('hidden-auth').value     = arrayBufferToBase64(subscription.getKey('auth'));
        document.getElementById('hidden-p256dh').value   = arrayBufferToBase64(subscription.getKey('p256dh'));
    }).catch((error) => {
        console.dir(error);
        console.error('Subscribing web push failed.');
    });
};

Notification.requestPermission().then((permission) => {
    switch (permission) {
        case 'granted':
            console.log('Web Push is permitted.');
            subscribeWebPush();
            break;
        case 'denied':
            window.alert('Please permit web push.');
            break;
        case 'default':
        default:
            break;
    }
});
