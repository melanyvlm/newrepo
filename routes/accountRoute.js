// Needed Resources 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")


// Ruta para la vista de inicio de sesión
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Ruta para la vista logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)


// Default route to account
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountManagement))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(), 
  regValidate.checkLoginData, 
  utilities.handleErrors(accountController.accountLogin) 
);



module.exports = router;
