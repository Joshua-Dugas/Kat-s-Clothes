
/*
***THIS IS NOT YET IN USE***
This factory router reduces the redundancy of having 
this database logic repeated in each individual router with
the same structure.
It allows for dynamic creation of inventory routes based on the table name.

Example item router when using this factory:
const createInventoryRouter = require("./inventoryRouterFactory");
module.exports = createInventoryRouter("Outerwear");
*/

const express = require("express");
const sql = require("../../server/db");

function createInventoryRouter(tableName, options = {}) {
    const router = express.Router();
    // Disable caching for all API responses
    router.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    // Fetch all items
    router.get("/", async (req, res) => {
        try {
            const result = await sql.unsafe(`SELECT * FROM ${tableName}`);
            console.log(result)
            res.json(result);
        
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    });

    // Add a new item
    router.post("/", async (req, res) => {
        try {
            // Map incoming fields if needed
            const {
                style,
                brand,
                color,
                gender,
                size,
                list_price,
                item_cost,
                is_sold
            } = req.body;

            // Basic validation
            if (!style || !brand || !color || !gender || size === undefined || list_price === undefined || item_cost === undefined) {
                return res.status(400).json({ error: "All fields except is_sold are required" });
            }

            const result = await sql.unsafe(
                `INSERT INTO ${tableName} (style, brand, color, gender, size, list_price, item_cost, is_sold)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [style, brand, color, gender, size, list_price, item_cost, is_sold ?? false]
            );
            res.status(201).json({ message: "Item added successfully", newItem: result[0] });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    });

    // Update is_sold status
    router.patch("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const { is_sold } = req.body;

            if (typeof is_sold !== "boolean") {
                return res.status(400).json({ error: "is_sold must be a boolean value" });
            }

            const result = await sql.unsafe(
                `UPDATE ${tableName} SET is_sold = $1 WHERE id = $2 RETURNING *`,
                [is_sold, id]
            );
            if (result.length === 0) {
                return res.status(404).json({ error: "Item not found" });
            }
            res.json({ message: "Status updated successfully", updatedItem: result[0] });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    });

    // Delete an item
    router.delete("/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const result = await sql.unsafe(
                `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`,
                [id]
            );
            if (result.length === 0) {
                return res.status(404).json({ error: "Item not found" });
            }
            res.json({ message: "Item deleted successfully", deletedItem: result[0] });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    });

    return router;
}

module.exports = createInventoryRouter;