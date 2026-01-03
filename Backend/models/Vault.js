import mongoose from "mongoose";
import crypto from "crypto";

// Encryption/Decryption functions
const algorithm = 'aes-256-cbc';
const secretKey = process.env.VAULT_SECRET_KEY || 'your-secret-key-32-characters-long!!'; // Should be 32 chars
const ivLength = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey.slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey.slice(0, 32)), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const VaultItemSchema = new mongoose.Schema({
  vaultId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Vault"
  },
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: ""
  },
  username: {
    type: String,
    default: ""
  },
  password: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  // Encrypted fields
  encryptedPassword: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Pre-save hook to encrypt password
VaultItemSchema.pre('save', function(next) {
  try {
    if (this.isModified('password') && this.password && this.password.trim() !== '') {
      this.encryptedPassword = encrypt(this.password);
      this.password = ''; // Clear plain text password
    }
    if (typeof next === 'function') {
      next();
    }
  } catch (error) {
    if (typeof next === 'function') {
      next(error);
    } else {
      throw error;
    }
  }
});

// Method to decrypt password
VaultItemSchema.methods.getDecryptedPassword = function() {
  if (this.encryptedPassword) {
    try {
      return decrypt(this.encryptedPassword);
    } catch (error) {
      return '';
    }
  }
  return '';
};

const VaultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Account"
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: "general"
  }
}, {
  timestamps: true
});

const Vault = mongoose.model("Vault", VaultSchema);
const VaultItem = mongoose.model("VaultItem", VaultItemSchema);

export { Vault, VaultItem };

