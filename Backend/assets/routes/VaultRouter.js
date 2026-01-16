import express from "express";
import {
  handleVaultsGet,
  handleVaultPost,
  handleVaultPut,
  handleVaultDelete,
  handleVaultItemsGet,
  handleVaultItemPost,
  handleVaultItemPut,
  handleVaultItemDelete,
  handleVaultExport
} from "../../controllers/Vault.js";

const VaultRouter = express.Router();

// Vault routes
VaultRouter.get("/vaults", handleVaultsGet);
VaultRouter.post("/vaults", handleVaultPost);
VaultRouter.put("/vaults/:id", handleVaultPut);
VaultRouter.delete("/vaults/:id", handleVaultDelete);

// Vault item routes
VaultRouter.get("/vaults/:vaultId/items", handleVaultItemsGet);
VaultRouter.get("/vaults/:vaultId/export", handleVaultExport);
VaultRouter.post("/vaults/:vaultId/items", handleVaultItemPost);
VaultRouter.put("/vaults/items/:id", handleVaultItemPut);
VaultRouter.delete("/vaults/items/:id", handleVaultItemDelete);

export default VaultRouter;

