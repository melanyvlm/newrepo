// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")


// Ruta para la vista de inicio de sesión
router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);

module.exports = router;
