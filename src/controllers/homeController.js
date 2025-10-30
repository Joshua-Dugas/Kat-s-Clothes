const db = require('../../server/db');

exports.getHome = async (req, res) => {
    try {
        // Query for sales and expenses
        const financialQuery = `
            SELECT
                SUM(CASE WHEN is_sold THEN list_price ELSE 0 END) AS total_sales,
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

        const allItemsQuery = `
            SELECT 'hats' AS category, id, style, brand, date_listed FROM hats WHERE is_sold = false AND date_listed IS NOT NULL
            UNION ALL
            SELECT 'bottoms', id, style, brand, date_listed FROM bottoms WHERE is_sold = false AND date_listed IS NOT NULL
            UNION ALL
            SELECT 'outerwear', id, style, brand, date_listed FROM outerwear WHERE is_sold = false AND date_listed IS NOT NULL
            UNION ALL
            SELECT 'shoes', id, style, brand, date_listed FROM shoes WHERE is_sold = false AND date_listed IS NOT NULL
            UNION ALL
            SELECT 'tops', id, style, brand, date_listed FROM tops WHERE is_sold = false AND date_listed IS NOT NULL
            UNION ALL
            SELECT 'misc', id, style, brand, date_listed FROM misc WHERE is_sold = false AND date_listed IS NOT NULL;
        `;

        const itemLossQuery = `
            SELECT 'hats' AS category, id, style, brand, list_price, item_cost FROM hats WHERE is_sold = true
            AND list_price < item_cost UNION ALL
            SELECT 'bottoms', id, style, brand, list_price, item_cost FROM bottoms WHERE is_sold = true
            AND list_price < item_cost UNION ALL
            SELECT 'outerwear', id, style, brand, list_price, item_cost FROM outerwear WHERE is_sold = true
            AND list_price < item_cost UNION ALL
            SELECT 'shoes', id, style, brand, list_price, item_cost FROM shoes WHERE is_sold = true
            AND list_price < item_cost UNION ALL
            SELECT 'tops', id, style, brand, list_price, item_cost FROM tops WHERE is_sold = true
            AND list_price < item_cost UNION ALL
            SELECT 'misc', id, style, brand, list_price, item_cost FROM misc WHERE is_sold = true
            AND list_price < item_cost;
        `;

        
        const [
            [financialRows],
            [countRows],
            [allItemsRows],
            [itemLossData]
        ] = await Promise.all([
            db.query(financialQuery),
            db.query(countsQuery),
            db.query(allItemsQuery),
            db.query(itemLossQuery)
        ]);

        // Calculate days listed for each item
        const today = new Date();
        const allItemsWithDays = allItemsRows.map(item => { 
            const listedDate = new Date(item.date_listed);
            const daysListed = Math.floor((today - listedDate) / (1000 * 60 * 60 * 24));
            return {
                ...item,
                days_listed: daysListed
            };
        });
        allItemsWithDays.sort((a, b) => b.days_listed - a.days_listed);

        console.log('Financial Query Result (Rows Only):', financialRows);
        console.log('Counts Query Result (Rows Only):', countRows);

        // Handle financial result (financialRows is clean)
        const { total_sales, total_expenses } = financialRows.length > 0
            ? financialRows[0]
            : { total_sales: 0, total_expenses: 0 };

        // Calculate sales vs expenses difference
        const salesVsExpensesDiff = Number(total_sales) - Number(total_expenses);

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
            salesVsExpensesDiff,
            itemCounts
        });

        res.render('home', {
            title: "Kat's Clothes",
            sales: Number(total_sales) || 0,
            expenses: Number(total_expenses) || 0,
            salesVsExpensesDiff,
            itemCounts,
            allItemsWithDays,
            itemLossData 
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err.stack);
        res.render('home', {
            title: "Kat's Clothes",
            sales: 0,
            expenses: 0,
            salesVsExpensesDiff: 0,
            itemCounts: { hats: 0, bottoms: 0, outerwear: 0, shoes: 0, tops: 0, misc: 0 },
            allItemsWithDays: [],
            itemLossData: [],
            error: 'Failed to load dashboard data: ' + err.message
        });
    }
};

//Routes
exports.getCosting = (req, res) => {
    res.render('costingManager', {title: 'Costing Manager'});
}

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