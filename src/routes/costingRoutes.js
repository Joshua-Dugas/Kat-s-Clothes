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

       
        let existsRows;
        try {
            const [rows] = await sql.query(`SELECT id FROM ${table_name} WHERE id = ?`, [id]);
            existsRows = rows;
            console.log("Executing existence check for table:", table_name, "with id:", id);
            console.log("Existence check result:", existsRows);
        } catch (queryErr) {
            console.error("Existence check error:", queryErr);
            throw new Error(`Failed to check existence: ${queryErr.message}`);
        }
        
        if (!existsRows || existsRows.length === 0) {
            return res.status(404).json({ error: `Record with ID ${id} not found in table ${table_name}` });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        
        if (item_cost !== undefined) {
            updates.push(`item_cost = ?`);
            values.push(item_cost);
        }
        if (list_price !== undefined) {
            updates.push(`list_price = ?`);
            values.push(list_price);
        }
        values.push(id); // ID goes last for the WHERE clause

        const updateQuery = `
            UPDATE ${table_name}
            SET ${updates.join(", ")}
            WHERE id = ?
        `;
        console.log("Executing query:", updateQuery, "with values:", values);
        
        let result;
        try {
            result = await sql.query(updateQuery, values);
            console.log("Raw update query result:", result);
        } catch (queryErr) {
            console.error("Update query error:", queryErr);
            throw new Error(`Failed to update: ${queryErr.message}`);
        }

        let updatedRow;
        try {
            const [rows] = await sql.query(`SELECT * FROM ${table_name} WHERE id = ?`, [id]);
            updatedRow = rows;
            console.log("Post-update fetch query result:", updatedRow);
        } catch (queryErr) {
            console.error("Post-update fetch query error:", queryErr);
            throw new Error(`Failed to verify update: ${queryErr.message}`);
        }

        if (!updatedRow || updatedRow.length === 0) {
            // This case should be rare if the update succeeded, but acts as a final safeguard.
            return res.status(404).json({ error: `Update failed or record disappeared for ID ${id} in table ${table_name}` });
        }

        // Return the first row from the fetch query
        res.json({ message: "Costing updated successfully", updatedItem: updatedRow[0] });
    } catch (err) {
        console.error("Error executing query:", err);
        // Ensure error message is safe for client
        res.status(500).send(`Server Error: Failed to process update request.`);
    }
});

module.exports = router;