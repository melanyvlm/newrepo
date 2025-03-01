// Needed Resources 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")


// Ruta para la vista de inicio de sesión
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)
// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(), // Aplica reglas de validación
  regValidate.checkLoginData, // Verifica errores antes de continuar
  utilities.handleErrors(accountController.loginAccount) // Ahora usa loginAccount
);
module.exports = router;
