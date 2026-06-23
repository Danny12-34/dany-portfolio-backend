const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Global Payload Read Route
router.get('/data', portfolioController.getPortfolioData);

// --- Projects CRUD Routing System ---
router.post('/projects', portfolioController.createProject);          // Create
router.put('/projects/:id', portfolioController.updateProject);       // Update
router.delete('/projects/:id', portfolioController.deleteProject);    // Delete

// --- Experience CRUD Routing System ---
router.post('/experience', portfolioController.createExperience);       // Create
router.put('/experience/:id', portfolioController.updateExperience);    // Update
router.delete('/experience/:id', portfolioController.deleteExperience); // Delete

module.exports = router;