//This is really sloppy and stupid but it works for now
exports.renderManager = (req, res) => {
    let typeManager = req.params.typeManager;
    if (!typeManager || !typeManager.endsWith("Manager")) {
        return res.status(404).render("home", { title: "Home", error: "Invalid inventory type" });
    }
    let type = typeManager.slice(0, -7).toLowerCase(); 
    const allowedTypes = ["shoe", "top", "bottom", "hat", "outerwear", "misc", "costing"];
    if (!allowedTypes.includes(type)) {
        console.error(`Invalid inventory type: ${type}`);
        return res.status(404).render("home", { title: "Home", error: "Invalid inventory type" });
    }
    console.log(`Rendering ${type} manager`);
    res.render(`${type}Manager`, { title: `${type.charAt(0).toUpperCase() + type.slice(1)} Manager` });
};


