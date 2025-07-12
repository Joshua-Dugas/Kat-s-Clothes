const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const inventoryController = require('../controllers/inventoryController');

//Route for generic inventory controller
router.get('/:typeManager', inventoryController.renderManager);

// Route for homepage
router.get('/', homeController.getHome);

// Route for managers
router.get('/costingManager', homeController.getCosting);
router.get('/shoeManager', homeController.getShoes);
router.get('/topManager', homeController.getTops);
router.get('/bottomManager', homeController.getBottoms);
router.get('/hatManager', homeController.getHats);
router.get('/outerwearManager', homeController.getOuterwear);
router.get('/miscManager', homeController.getMisc);

module.exports = router;