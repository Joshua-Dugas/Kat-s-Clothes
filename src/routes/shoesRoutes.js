const express = require("express");
const router = express.Router();
const sql = require("../../server/db");

//TODO We need to be able to navigate to home page without interrupting the shoe router. Probably need to update the path of the shoe router stuff.
//const shoesController = require('../controllers/shoesController');

// Route for homepage
//router.get('/', shoesController.getHome);

// Fetch all shoes
router.get("/", async (req, res) => {
    try {
        const result = await sql`SELECT * FROM Shoes`;
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add a new shoe
router.post("/", async (req, res) => {
    try {
        const { name, brand, color, gender, size, list_price, item_cost, is_sold } = req.body;

        // Basic validation
        if (!name || !brand || !color || !gender || size === undefined || list_price === undefined || item_cost === undefined) {
            return res.status(400).json({ error: "All fields except is_sold are required" });
        }

        const result = await sql`
            INSERT INTO Shoes (name, brand, color, gender, size, list_price, item_cost, is_sold)
            VALUES (${name}, ${brand}, ${color}, ${gender}, ${size}, ${list_price}, ${item_cost}, ${is_sold ?? false})
            RETURNING *
        `;
        res.status(201).json({ message: "Shoe added successfully", newShoe: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Update is_sold status for a shoe by ID
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { is_sold } = req.body;

        // Validate is_sold
        if (typeof is_sold !== "boolean") {
            return res.status(400).json({ error: "is_sold must be a boolean value" });
        }

        const result = await sql`
            UPDATE Shoes
            SET is_sold = ${is_sold}
            WHERE id = ${id}
            RETURNING *
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: "Shoe not found" });
        }
        res.json({ message: "Shoe status updated successfully", updatedShoe: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Delete a shoe by ID
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sql`DELETE FROM Shoes WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ error: "Shoe not found" });
        }
        res.json({ message: "Shoe deleted successfully", deletedShoe: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;