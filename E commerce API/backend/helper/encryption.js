const crypto = require('crypto');

class EncryptionService {
    constructor() {
        // Use ENCRYPTION_KEY from environment variables, fallback to a default key
        // In production, always use a secure environment variable
        this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
        
        // Ensure key is 32 bytes for AES-256
        if (typeof this.encryptionKey === 'string') {
            this.encryptionKey = crypto
                .createHash('sha256')
                .update(String(this.encryptionKey))
                .digest();
        }
        
        this.algorithm = 'aes-256-gcm';
    }

    /**
     * Encrypt sensitive data
     * @param {string} data - Data to encrypt
     * @returns {object} - { encrypted, iv, authTag } - all as base64 strings
     */
    encrypt(data) {
        try {
            if (!data) return null;

            // Generate random IV (Initialization Vector)
            const iv = crypto.randomBytes(16);
            
            // Create cipher
            const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
            
            // Encrypt data
            let encrypted = cipher.update(String(data), 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            // Get authentication tag
            const authTag = cipher.getAuthTag();
            
            // Return as base64 strings for storage
            return {
                encrypted: Buffer.from(encrypted, 'hex').toString('base64'),
                iv: iv.toString('base64'),
                authTag: authTag.toString('base64')
            };
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    /**
     * Decrypt sensitive data
     * @param {object} encryptedData - { encrypted, iv, authTag } as base64 strings
     * @returns {string} - Decrypted data
     */
    decrypt(encryptedData) {
        try {
            if (!encryptedData || !encryptedData.encrypted) return null;

            // Convert from base64
            const encrypted = Buffer.from(encryptedData.encrypted, 'base64').toString('hex');
            const iv = Buffer.from(encryptedData.iv, 'base64');
            const authTag = Buffer.from(encryptedData.authTag, 'base64');
            
            // Create decipher
            const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
            decipher.setAuthTag(authTag);
            
            // Decrypt data
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    /**
     * Tokenize card number (return last 4 digits and token)
     * This is useful for storing tokenized references instead of full card numbers
     * @param {string} cardNumber - Full card number
     * @returns {object} - { token, last4Digits }
     */
    tokenizeCardNumber(cardNumber) {
        try {
            const last4 = String(cardNumber).slice(-4);
            const encryptedData = this.encrypt(cardNumber);
            const token = Buffer.from(JSON.stringify(encryptedData)).toString('base64');
            
            return {
                cardToken: token,
                last4Digits: last4
            };
        } catch (error) {
            throw new Error(`Tokenization failed: ${error.message}`);
        }
    }

    /**
     * Retrieve card number from token
     * @param {string} cardToken - Tokenized card data
     * @returns {string} - Decrypted card number
     */
    detokenizeCardNumber(cardToken) {
        try {
            if (!cardToken) return null;
            
            const encryptedData = JSON.parse(Buffer.from(cardToken, 'base64').toString('utf8'));
            return this.decrypt(encryptedData);
        } catch (error) {
            throw new Error(`Detokenization failed: ${error.message}`);
        }
    }
}

// Export singleton instance
module.exports = new EncryptionService();
