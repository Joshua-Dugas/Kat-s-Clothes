const express = require("express");
const router = express.Router();
const sql = require("../../server/db");

// Fetch all misc item
router.get("/", async (req, res) => {
    try {
        const result = await sql`SELECT * FROM misc`;
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add a new misc item
router.post("/", async (req, res) => {
    try {
        const { name: style, brand, color, gender, size, list_price, item_cost, is_sold } = req.body;

        // Basic validation
        if (!style || !brand || !color || !gender || size === undefined || list_price === undefined || item_cost === undefined) {
            return res.status(400).json({ error: "All fields except is_sold are required" });
        }

        const result = await sql`
            INSERT INTO misc (style, brand, color, gender, size, list_price, item_cost, is_sold)
            VALUES (${style}, ${brand}, ${color}, ${gender}, ${size}, ${list_price}, ${item_cost}, ${is_sold ?? false})
            RETURNING *
        `;
        res.status(201).json({ message: "Misc item added successfully", newMisc: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Update is_sold status for a misc item by ID
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_sold } = req.body;

        // Validate is_sold
        if (typeof is_sold !== "boolean") {
            return res.status(400).json({ error: "is_sold must be a boolean value" });
        }

        const result = await sql`
            UPDATE misc
            SET is_sold = ${is_sold}
            WHERE id = ${id}
            RETURNING *
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: "Misc item not found" });
        }
        res.json({ message: "Misc item status updated successfully", updatedMisc: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Delete an Misc item by ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql`DELETE FROM misc WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ error: "Misc item not found" });
        }
        res.json({ message: "Misc item deleted successfully", deletedMisc: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;