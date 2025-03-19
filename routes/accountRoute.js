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
// Process update view
router.get(
  "/update",
  utilities.checkJWTToken,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);


// Process update inputs
router.post(
  "/update",
  utilities.checkJWTToken,
  regValidate.updateAccountRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process update password
router.post(
  "/change-password",
  utilities.checkJWTToken,
  regValidate.changePasswordRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.changePassword)
);
module.exports = router;
