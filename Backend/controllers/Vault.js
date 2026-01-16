import { Vault, VaultItem } from "../models/Vault.js";
import mongoose from "mongoose";
import crypto from "crypto";

// Encryption/Decryption functions (same as in model)
const algorithm = 'aes-256-cbc';
const secretKey = process.env.VAULT_SECRET_KEY || 'your-secret-key-32-characters-long!!';
const ivLength = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey.slice(0, 32)), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// GET /feature/vaults - Get all vaults for a user
async function handleVaultsGet(req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const vaults = await Vault.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json(vaults);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// POST /feature/vaults - Create a new vault
async function handleVaultPost(req, res) {
  try {
    const { userId, name, description, category } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        message: "userId and name are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const vault = await Vault.create({
      userId,
      name,
      description: description || "",
      category: category || "general"
    });

    res.status(201).json(vault);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/vaults/:id - Update a vault
async function handleVaultPut(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid vault id format"
      });
    }

    const vault = await Vault.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!vault) {
      return res.status(404).json({
        message: "Vault not found"
      });
    }

    res.status(200).json(vault);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /feature/vaults/:id - Delete a vault and all its items
async function handleVaultDelete(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid vault id format"
      });
    }

    // Delete all items in the vault first
    await VaultItem.deleteMany({ vaultId: id });

    // Delete the vault
    const deletedVault = await Vault.findByIdAndDelete(id);
    if (!deletedVault) {
      return res.status(404).json({ message: "Vault not found" });
    }
    
    return res.status(200).json({ message: "Vault deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// GET /feature/vaults/:vaultId/items - Get all items in a vault
async function handleVaultItemsGet(req, res) {
  try {
    const { vaultId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({
        message: "Invalid vault id format"
      });
    }

    const items = await VaultItem.find({ vaultId }).sort({ createdAt: -1 });
    
    // Decrypt passwords for response
    const itemsWithDecrypted = items.map(item => {
      const itemObj = item.toObject();
      if (itemObj.encryptedPassword) {
        itemObj.password = item.getDecryptedPassword();
      }
      return itemObj;
    });
    
    res.status(200).json(itemsWithDecrypted);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// POST /feature/vaults/:vaultId/items - Create a new vault item
async function handleVaultItemPost(req, res) {
  try {
    const { vaultId } = req.params;
    const { name, link, username, password, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "name is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({
        message: "Invalid vault id format"
      });
    }

    // Verify vault exists
    const vault = await Vault.findById(vaultId);
    if (!vault) {
      return res.status(404).json({
        message: "Vault not found"
      });
    }

    // Encrypt password if provided
    let encryptedPassword = '';
    if (password && password.trim() !== '') {
      encryptedPassword = encrypt(password);
    }

    const item = await VaultItem.create({
      vaultId,
      name,
      link: link || "",
      username: username || "",
      password: "", // Don't store plain text
      encryptedPassword: encryptedPassword,
      notes: notes || ""
    });

    // Return item with decrypted password
    const itemObj = item.toObject();
    if (item.encryptedPassword) {
      itemObj.password = item.getDecryptedPassword();
    } else if (password) {
      itemObj.password = password; // Return original if encryption didn't happen
    }

    res.status(201).json(itemObj);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/vaults/items/:id - Update a vault item
async function handleVaultItemPut(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid item id format"
      });
    }

    // Handle password encryption manually since findByIdAndUpdate doesn't run pre-save hooks
    if (updateData.password !== undefined) {
      if (updateData.password && updateData.password.trim() !== '') {
        updateData.encryptedPassword = encrypt(updateData.password);
      } else {
        updateData.encryptedPassword = '';
      }
      updateData.password = ''; // Clear plain text password
    }

    const item = await VaultItem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        message: "Vault item not found"
      });
    }

    // Return item with decrypted password
    const itemObj = item.toObject();
    if (item.encryptedPassword) {
      itemObj.password = item.getDecryptedPassword();
    }

    res.status(200).json(itemObj);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /feature/vaults/items/:id - Delete a vault item
async function handleVaultItemDelete(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid item id format"
      });
    }

    const deletedItem = await VaultItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Vault item not found" });
    }
    
    return res.status(200).json({ message: "Vault item deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// GET /feature/vaults/:vaultId/export - Export vault items as CSV
async function handleVaultExport(req, res) {
  try {
    const { vaultId } = req.params;
    const { userId } = req.query;

    if (!vaultId) {
      return res.status(400).json({
        message: "vaultId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vaultId)) {
      return res.status(400).json({
        message: "Invalid vault id format"
      });
    }

    // Verify vault exists and belongs to user if userId provided
    const vault = await Vault.findById(vaultId);
    if (!vault) {
      return res.status(404).json({
        message: "Vault not found"
      });
    }

    if (userId && vault.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Get all items in the vault
    const items = await VaultItem.find({ vaultId }).sort({ createdAt: -1 });

    // Generate CSV content
    let csvContent = 'Item Name,Link,Username,Password,Notes\n';
    
    items.forEach(item => {
      const name = (item.name || '').replace(/"/g, '""');
      const link = (item.link || '').replace(/"/g, '""');
      const username = (item.username || '').replace(/"/g, '""');
      // Decrypt password for export
      let password = '';
      if (item.encryptedPassword) {
        password = item.getDecryptedPassword().replace(/"/g, '""');
      }
      const notes = (item.notes || '').replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
      
      csvContent += `"${name}","${link}","${username}","${password}","${notes}"\n`;
    });

    // Set headers for CSV download
    const vaultName = (vault.name || 'vault').replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="vault_${vaultName}_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export {
  handleVaultsGet,
  handleVaultPost,
  handleVaultPut,
  handleVaultDelete,
  handleVaultItemsGet,
  handleVaultItemPost,
  handleVaultItemPut,
  handleVaultItemDelete,
  handleVaultExport
};

