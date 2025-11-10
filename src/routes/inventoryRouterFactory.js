const express = require("express");
const sql = require("../../server/db"); 

function createInventoryRouter(tableName, options = {}) {
    const router = express.Router();
    router.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

// Fetch all items
router.get("/", async (req, res) => {
    try {
        const [rows] = await sql.query(`SELECT * FROM ${tableName}`);
        res.json(rows);
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
            is_sold = 0,
            date_listed = new Date().toISOString().split("T")[0]
        } = req.body;

        if (!style || !brand || !color || !gender || size === undefined || list_price === undefined || item_cost === undefined) {
            return res.status(400).json({ error: "All fields except is_sold and date_listed are required" });
        }

        const finalDateListed = date_listed && date_listed.trim() !== "" ? date_listed : new Date().toISOString().split("T")[0];

        const insertQuery = `
            INSERT INTO ${tableName} (style, brand, color, gender, size, list_price, item_cost, is_sold, date_listed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [style, brand, color, gender, size, list_price, item_cost, is_sold, finalDateListed];

        const [resultInfo] = await sql.query(insertQuery, values);

        const [newItemRows] = await sql.query(`SELECT * FROM ${tableName} WHERE id = ?`, [resultInfo.insertId]);
        const newItem = newItemRows.length > 0 ? newItemRows[0] : null;

        res.status(201).json({
            message: "Item added successfully",
            newItem: newItem
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Update new_tag or is_sold statuses
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_sold, new_tag } = req.body;

        // Build dynamic SET clause and values
        const fields = [];
        const values = [];

        if (typeof is_sold === "boolean") {
            fields.push(`is_sold = ?`);
            values.push(is_sold);
        }
        if (typeof new_tag === "boolean") {
            fields.push(`new_tag = ?`);
            values.push(new_tag);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: "No valid fields to update" });
        }

        values.push(id); // For WHERE clause

        const updateQuery = `
            UPDATE ${tableName} SET ${fields.join(", ")} WHERE id = ?
        `;
        await sql.query(updateQuery, values); // The update result is not the rows

        // Fetch the updated item separately
        const [updatedItemRows] = await sql.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
        const updatedItem = updatedItemRows.length > 0 ? updatedItemRows[0] : null;

        res.status(200).json({
            message: "Status updated successfully",
            updatedItem: updatedItem
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

        // Fetch the item before deletion to return it in the response
        const [deletedItemRows] = await sql.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
        const deletedItem = deletedItemRows.length > 0 ? deletedItemRows[0] : null;

        const deleteQuery = `
            DELETE FROM ${tableName} WHERE id = ?
        `;
        const deleteValues = [id];
        await sql.query(deleteQuery, deleteValues);

        res.status(200).json({
            message: "Item deleted successfully",
            deletedItem: deletedItem
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

    return router;
}

module.exports = createInventoryRouter;