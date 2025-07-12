const express = require("express");
const router = express.Router();
const sql = require("../../server/db");

// List of allowed table names to prevent SQL injection
const allowedTables = ["shoes", "tops", "bottoms", "hats", "outerwear", "misc"]; // Match your database table names

// Update item_cost or list_price for a specific item
router.patch("/update", async (req, res) => {
    try {
        const { table_name, id, item_cost, list_price } = req.body;

        // Validate inputs
        if (!table_name || !id) {
            return res.status(400).json({ error: "Table name and ID are required" });
        }

        // Validate table name
        if (!allowedTables.includes(table_name)) {
            return res.status(400).json({ error: "Invalid table name" });
        }

        // Validate that at least one field is provided
        if (item_cost === undefined && list_price === undefined) {
            return res.status(400).json({ error: "At least one of item_cost or list_price must be provided" });
        }

        // Validate numeric fields
        if (item_cost !== undefined && (isNaN(item_cost) || item_cost < 0)) {
            return res.status(400).json({ error: "Item cost must be a non-negative number" });
        }
        if (list_price !== undefined && (isNaN(list_price) || list_price < 0)) {
            return res.status(400).json({ error: "List price must be a non-negative number" });
        }

        // Check if the record exists
        let exists;
        try {
            if (table_name === "shoes") {
                exists = await sql`SELECT id FROM shoes WHERE id = ${id}`;
            } else if (table_name === "tops") {
                exists = await sql`SELECT id FROM tops WHERE id = ${id}`;
            } else if (table_name === "bottoms") {
                exists = await sql`SELECT id FROM bottoms WHERE id = ${id}`;
            } else if (table_name === "hats") {
                exists = await sql`SELECT id FROM hats WHERE id = ${id}`;
            } else if (table_name === "outerwear") {
                exists = await sql`SELECT id FROM outerwear WHERE id = ${id}`;
            } else if (table_name === "misc") {
                exists = await sql`SELECT id FROM misc WHERE id = ${id}`;
            }
            console.log("Executing existence check for table:", table_name, "with id:", id);
            console.log("Existence check result:", exists);
        } catch (queryErr) {
            console.error("Existence check error:", queryErr);
            throw new Error(`Failed to check existence: ${queryErr.message}`);
        }
        if (!exists || exists.length === 0) {
            return res.status(404).json({ error: `Record with ID ${id} not found in table ${table_name}` });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        if (item_cost !== undefined) {
            updates.push(`item_cost = $${values.length + 1}`);
            values.push(item_cost);
        }
        if (list_price !== undefined) {
            updates.push(`list_price = $${values.length + 1}`);
            values.push(list_price);
        }
        values.push(id);

        const updateQuery = `
            UPDATE "${table_name}"
            SET ${updates.join(", ")}
            WHERE id = $${values.length}
            RETURNING *
        `;
        console.log("Executing query:", updateQuery, "with values:", values);
        let result;
        try {
            result = await sql.query(updateQuery, values);
            console.log("Raw update query result:", result);
            console.log("Update query rows:", result ? result.rows : "null or undefined");
        } catch (queryErr) {
            console.error("Update query error:", queryErr);
            throw new Error(`Failed to update: ${queryErr.message}`);
        }

        // Fallback: Query the updated row to confirm the change
        let updatedRow;
        try {
            if (table_name === "shoes") {
                updatedRow = await sql`SELECT * FROM shoes WHERE id = ${id}`;
            } else if (table_name === "tops") {
                updatedRow = await sql`SELECT * FROM tops WHERE id = ${id}`;
            } else if (table_name === "bottoms") {
                updatedRow = await sql`SELECT * FROM bottoms WHERE id = ${id}`;
            } else if (table_name === "hats") {
                updatedRow = await sql`SELECT * FROM hats WHERE id = ${id}`;
            } else if (table_name === "outerwear") {
                updatedRow = await sql`SELECT * FROM outerwear WHERE id = ${id}`;
            } else if (table_name === "misc") {
                updatedRow = await sql`SELECT * FROM misc WHERE id = ${id}`;
            }
            console.log("Fallback query result:", updatedRow);
        } catch (queryErr) {
            console.error("Fallback query error:", queryErr);
            throw new Error(`Failed to verify update: ${queryErr.message}`);
        }

        if (!updatedRow || updatedRow.length === 0) {
            return res.status(404).json({ error: `Update failed for ID ${id} in table ${table_name}` });
        }

        res.json({ message: "Costing updated successfully", updatedItem: updatedRow[0] });
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send(`Server Error: ${err.message}`);
    }
});

module.exports = router;