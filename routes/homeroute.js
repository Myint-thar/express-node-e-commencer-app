const express = require('express');
const router = express.Router();
const homeController = require('../controller/homeController');

// GET Home Page
router.get('/', homeController.getHomePage);

router.get('/faq', (req, res) => {
  res.render('faq');
});

module.exports = router;