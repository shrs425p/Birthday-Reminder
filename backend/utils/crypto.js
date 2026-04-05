require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const keyString = process.env.DB_ENCRYPTION_KEY;
const keySalt = process.env.DB_ENCRYPTION_SALT;

if (!keyString) {
    throw new Error('Missing required environment variable: DB_ENCRYPTION_KEY');
}

if (!keySalt) {
    throw new Error('Missing required environment variable: DB_ENCRYPTION_SALT');
}

const key = crypto.scryptSync(keyString, keySalt, 32);

function encrypt(text) {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (e) {
        console.error('[Crypto] Encryption error:', e.message);
        return text;
    }
}

function decrypt(text) {
    if (!text) return text;
    try {
        const parts = text.split(':');
        // If it doesn't look like our encrypted format (iv:encryptedText), return as is
        if (parts.length !== 2) return text;

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error('[Crypto] Decryption error:', e.message);
        // If decryption fails (e.g., key changed, or it wasn't actually encrypted),
        // fallback to returning the original text to prevent breaking everything.
        return text;
    }
}

module.exports = {
    encrypt,
    decrypt
};
