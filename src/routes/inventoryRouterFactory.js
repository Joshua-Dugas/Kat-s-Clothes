
/*
This factory router reduces the redundancy of having 
this database logic repeated in each individual router with
the same structure.
It allows for dynamic creation of inventory routes based on the table name.
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
        const result = await sql.query(`SELECT * FROM ${tableName}`);
        console.log("Fetched items:", result);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add a new item
router.post("/", async (req, res) => {
    try {
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

        if (!style || !brand || !color || !gender || size === undefined || list_price === undefined || item_cost === undefined) {
            return res.status(400).json({ error: "All fields except is_sold are required" });
        }

        const insertQuery = `
            INSERT INTO ${tableName} (style, brand, color, gender, size, list_price, item_cost, is_sold)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [style, brand, color, gender, size, list_price, item_cost, is_sold ?? false];
        const result = await sql.query(insertQuery, values);

        console.log("Insert result:", result);

        res.status(201).json({
                    message: "Item added successfully",
                    newItem: result.rows && result.rows.length > 0 ? result.rows[0] : null
                });
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

        const updateQuery = `
            UPDATE ${tableName} SET is_sold = $1 WHERE id = $2 RETURNING *
        `;
        const updateValues = [is_sold, id];
        const result = await sql.query(updateQuery, updateValues);

        res.status(200).json({
            message: "Status updated successfully",
            updatedItem: result.rows && result.rows.length > 0 ? result.rows[0] : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// Delete an item
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuery = `
            DELETE FROM ${tableName} WHERE id = $1 RETURNING *
        `;
        const deleteValues = [id];
        const result = await sql.query(deleteQuery, deleteValues);

        res.status(200).json({
            message: "Item deleted successfully",
            deletedItem: result.rows && result.rows.length > 0 ? result.rows[0] : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

    return router;
}

module.exports = createInventoryRouter;