// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New route to show details of a vehicle 
router.get("/detail/:id", invController.displayVehicleDetails);

module.exports = router;