const { Resend } = require('resend');

const resend = new Resend('re_123'); // Dummy key, we just want to load the module

console.log('Resend module loaded successfully');
try {
    const svix = require('svix');
    console.log('Svix module loaded successfully');
    console.log('HttpErrors:', require('svix/dist/HttpErrors'));
} catch (e) {
    console.error('Svix failed:', e);
}
