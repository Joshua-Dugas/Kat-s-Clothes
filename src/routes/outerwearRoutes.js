const express = require("express");
const router = express.Router();
const sql = require("../../server/db");

// Fetch all Outerwear
router.get("/", async (req, res) => {
    try {
        const result = await sql`SELECT * FROM Outerwear`;
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add a new Outerwear
router.post("/", async (req, res) => {
    try {
        const { name: style, brand, color, gender, size, list_price, item_cost, is_sold } = req.body;

        // Basic validation
        if (!style || !brand || !color || !gender || size === undefined || list_price === undefined || item_cost === undefined) {
            return res.status(400).json({ error: "All fields except is_sold are required" });
        }

        const result = await sql`
            INSERT INTO Outerwear (style, brand, color, gender, size, list_price, item_cost, is_sold)
            VALUES (${style}, ${brand}, ${color}, ${gender}, ${size}, ${list_price}, ${item_cost}, ${is_sold ?? false})
            RETURNING *
        `;
        res.status(201).json({ message: "Outerwear added successfully", newOuterwear: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Delete a Outerwear by ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql`DELETE FROM Outerwear WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ error: "Outerwear not found" });
        }
        res.json({ message: "Outerwear deleted successfully", deletedOuterwear: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;