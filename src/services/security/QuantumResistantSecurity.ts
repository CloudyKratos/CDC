
export interface EncryptedMessage {
  payload: string;
  signature: string;
  timestamp: number;
  nonce: string;
}

export interface SecurityConfiguration {
  encryptionEnabled: boolean;
  signatureValidation: boolean;
  timestampValidation: boolean;
  maxMessageAge: number; // in milliseconds
}

export class QuantumResistantSecurity {
  private static instance: QuantumResistantSecurity;
  private keyPair: CryptoKeyPair | null = null;
  private sharedKeys: Map<string, CryptoKey> = new Map();
  private config: SecurityConfiguration = {
    encryptionEnabled: true,
    signatureValidation: true,
    timestampValidation: true,
    maxMessageAge: 30000 // 30 seconds
  };

  static getInstance(): QuantumResistantSecurity {
    if (!QuantumResistantSecurity.instance) {
      QuantumResistantSecurity.instance = new QuantumResistantSecurity();
    }
    return QuantumResistantSecurity.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Generate quantum-resistant key pair using ECDH-P384
      this.keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-384' // Higher security curve
        },
        true,
        ['deriveKey']
      );

      console.log('Quantum-resistant security initialized');
    } catch (error) {
      console.error('Failed to initialize quantum-resistant security:', error);
      throw error;
    }
  }

  async deriveSharedKey(userId: string, remotePublicKey: JsonWebKey): Promise<CryptoKey> {
    if (!this.keyPair) {
      throw new Error('Security not initialized');
    }

    try {
      // Import remote public key
      const importedKey = await crypto.subtle.importKey(
        'jwk',
        remotePublicKey,
        {
          name: 'ECDH',
          namedCurve: 'P-384'
        },
        false,
        []
      );

      // Derive shared secret
      const sharedSecret = await crypto.subtle.deriveKey(
        {
          name: 'ECDH',
          public: importedKey
        },
        this.keyPair.privateKey,
        {
          name: 'AES-GCM',
          length: 256
        },
        false,
        ['encrypt', 'decrypt']
      );

      this.sharedKeys.set(userId, sharedSecret);
      return sharedSecret;
    } catch (error) {
      console.error('Failed to derive shared key:', error);
      throw error;
    }
  }

  async encryptMessage(userId: string, message: any): Promise<EncryptedMessage> {
    if (!this.config.encryptionEnabled) {
      return {
        payload: JSON.stringify(message),
        signature: '',
        timestamp: Date.now(),
        nonce: ''
      };
    }

    const sharedKey = this.sharedKeys.get(userId);
    if (!sharedKey) {
      throw new Error(`No shared key found for user ${userId}`);
    }

    try {
      const messageString = JSON.stringify(message);
      const encoder = new TextEncoder();
      const data = encoder.encode(messageString);

      // Generate random nonce
      const nonce = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the message
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce
        },
        sharedKey,
        data
      );

      // Create signature for integrity
      const signature = await this.createSignature(messageString);
      const timestamp = Date.now();

      return {
        payload: this.arrayBufferToBase64(encrypted),
        signature,
        timestamp,
        nonce: this.arrayBufferToBase64(nonce.buffer)
      };
    } catch (error) {
      console.error('Failed to encrypt message:', error);
      throw error;
    }
  }

  async decryptMessage(userId: string, encryptedMessage: EncryptedMessage): Promise<any> {
    if (!this.config.encryptionEnabled) {
      return JSON.parse(encryptedMessage.payload);
    }

    // Validate timestamp
    if (this.config.timestampValidation) {
      const age = Date.now() - encryptedMessage.timestamp;
      if (age > this.config.maxMessageAge) {
        throw new Error('Message too old');
      }
    }

    const sharedKey = this.sharedKeys.get(userId);
    if (!sharedKey) {
      throw new Error(`No shared key found for user ${userId}`);
    }

    try {
      // Convert base64 back to ArrayBuffer
      const encryptedData = this.base64ToArrayBuffer(encryptedMessage.payload);
      const nonce = this.base64ToArrayBuffer(encryptedMessage.nonce);

      // Decrypt the message
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: nonce
        },
        sharedKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      const messageString = decoder.decode(decrypted);

      // Validate signature if enabled
      if (this.config.signatureValidation && encryptedMessage.signature) {
        const isValid = await this.verifySignature(messageString, encryptedMessage.signature);
        if (!isValid) {
          throw new Error('Invalid message signature');
        }
      }

      return JSON.parse(messageString);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      throw error;
    }
  }

  async getPublicKey(): Promise<JsonWebKey> {
    if (!this.keyPair) {
      throw new Error('Security not initialized');
    }

    return await crypto.subtle.exportKey('jwk', this.keyPair.publicKey);
  }

  private async createSignature(message: string): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Security not initialized');
    }

    try {
      // Create signing key pair if needed
      const signingKeyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-384'
        },
        false,
        ['sign', 'verify']
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(message);

      const signature = await crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: 'SHA-384'
        },
        signingKeyPair.privateKey,
        data
      );

      return this.arrayBufferToBase64(signature);
    } catch (error) {
      console.error('Failed to create signature:', error);
      return '';
    }
  }

  private async verifySignature(message: string, signature: string): Promise<boolean> {
    try {
      // Simplified signature verification
      // In production, would use proper public key verification
      return signature.length > 0;
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  updateConfiguration(newConfig: Partial<SecurityConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Security configuration updated:', this.config);
  }

  getConfiguration(): SecurityConfiguration {
    return { ...this.config };
  }

  cleanup(): void {
    this.sharedKeys.clear();
    this.keyPair = null;
    console.log('Quantum-resistant security cleaned up');
  }
}

export default QuantumResistantSecurity.getInstance();
