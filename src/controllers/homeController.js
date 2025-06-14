const db = require('../../server/db');

exports.getHome = async (req, res) => {
    try {
        // Query for sales and expenses
        const financialQuery = `
            SELECT
                SUM(CASE WHEN is_sold THEN list_price - item_cost ELSE 0 END) AS total_sales,
                SUM(item_cost) AS total_expenses
            FROM (
                SELECT list_price, item_cost, is_sold FROM hats
                UNION ALL
                SELECT list_price, item_cost, is_sold FROM bottoms
                UNION ALL
                SELECT list_price, item_cost, is_sold FROM outerwear
                UNION ALL
                SELECT list_price, item_cost, is_sold FROM shoes
                UNION ALL
                SELECT list_price, item_cost, is_sold FROM tops
                UNION ALL
                SELECT list_price, item_cost, is_sold FROM misc
            ) AS all_items;
        `;

        // Query for item counts per table
        const countsQuery = `
            SELECT 'hats' AS table_name, COUNT(*) AS item_count FROM hats
            UNION ALL
            SELECT 'bottoms' AS table_name, COUNT(*) AS item_count FROM bottoms
            UNION ALL
            SELECT 'outerwear' AS table_name, COUNT(*) AS item_count FROM outerwear
            UNION ALL
            SELECT 'shoes' AS table_name, COUNT(*) AS item_count FROM shoes
            UNION ALL
            SELECT 'tops' AS table_name, COUNT(*) AS item_count FROM tops
            UNION ALL
            SELECT 'misc' AS table_name, COUNT(*) AS item_count FROM misc;
        `;

        const [financialResult, countsResult] = await Promise.all([
            db.query(financialQuery),
            db.query(countsQuery)
        ]);

        console.log('Financial Query Result:', financialResult);
        console.log('Counts Query Result:', countsResult); //

        // Handle financial result
        const rows = Array.isArray(financialResult) ? financialResult : financialResult.rows;

        const { total_sales, total_expenses } = rows.length > 0
            ? rows[0]
            : { total_sales: 0, total_expenses: 0 };

        // Handle counts result
        const countRows = Array.isArray(countsResult) ? countsResult : countsResult.rows;

        // Transform counts into an object for easier access in EJS
        const itemCounts = {
            hats: 0,
            bottoms: 0,
            outerwear: 0,
            shoes: 0,
            tops: 0,
            misc: 0
        };
        countRows.forEach(row => {
            itemCounts[row.table_name] = Number(row.item_count) || 0;
        });

        console.log('Variables to Render:', {
            sales: Number(total_sales),
            expenses: Number(total_expenses),
            itemCounts
        });

        res.render('home', {
            title: "Kat's Clothes",
            sales: Number(total_sales) || 0,
            expenses: Number(total_expenses) || 0,
            itemCounts
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err.stack);
        res.render('home', {
            title: "Kat's Clothes",
            sales: 0,
            expenses: 0,
            itemCounts: { hats: 0, bottoms: 0, outerwear: 0, shoes: 0, tops: 0, misc: 0 },
            error: 'Failed to load dashboard data: ' + err.message
        });
    }
};

//Routes
exports.getShoes = (req, res) => {
    res.render('shoeManager', { title: 'Shoe Manager' });
};

exports.getTops = (req, res) => {
    res.render('topManager', { title: 'Top Manager' });
};

exports.getBottoms = (req, res) => {
    res.render('bottomManager', { title: 'Bottom Manager' });
};

exports.getHats = (req, res) => {
    res.render('hatManager', { title: 'Hat Manager' });
};

exports.getOuterwear = (req, res) => {
    res.render('outerwearManager', { title: 'Outerwear Manager' });
};

exports.getMisc = (req, res) => {
    res.render('miscManager', { title: 'Misc Manager' });
};