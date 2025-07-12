const express = require("express");
const createInventoryRouter = require("./inventoryRouterFactory");

const router = express.Router();

// List of inventory tables
const tables = ["shoes", "tops", "bottoms", "hats", "outerwear", "misc"];

// Register each inventory router under its own path
tables.forEach(table => {
    router.use(`/api/${table}`, createInventoryRouter(table));
});

module.exports = router;