
exports.getHome = (req, res) => {
    res.render('home', { title: 'Home' });
};

exports.getShoes = (req, res) => {
    res.render('shoeManager', { title: 'Shoes' });
};

exports.getTops = (req, res) => {
    res.render('topManager', { title: 'Tops' });
};

exports.getBottoms = (req, res) => {
    res.render('bottomManager', { title: 'Bottoms' });
};

exports.getHats = (req, res) => {
    res.render('hatManager', { title: 'Hats' });
};

exports.getOuterwear = (req, res) => {
    res.render('outerwearManager', { title: 'Outerwear' });
};