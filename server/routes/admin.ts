import { Router } from "express";
import { requireAdmin } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.get("/overview", requireAdmin, (_request, response) => {
  response.json({
    revenue: 1820000,
    users: 18240,
    orders: 486,
    inventoryAlerts: 7,
    moderationQueue: 12
  });
});

adminRouter.get("/audit-logs", requireAdmin, (_request, response) => {
  response.json({
    logs: [
      { action: "PRODUCT_UPDATED", actor: "admin@tapyfi.com", at: new Date().toISOString() },
      { action: "TEAM_CREATED", actor: "owner@tapyfi.com", at: new Date().toISOString() }
    ]
  });
});
