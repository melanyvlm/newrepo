// Needed Resources

const utilities = require("../utilities/")
const accountController = {}
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}


/* ****************************************
*  Deliver Account Management view
* *************************************** */
async function accountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { 
    account_firstname, 
    account_lastname, 
    account_email, 
    account_password 
  } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Build Update Account View
 * ************************************ */
async function buildUpdateAccountView(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData; // From checkJWTToken
  res.render("account/update", {
    title: "Update Account:",
    nav,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
    errors: null
  });
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Update Account Information
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  // Actualizar la cuenta en la base de datos
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

  if (updateResult) {
    // Obtener los datos actualizados
    const updatedAccount = await accountModel.getAccountById(account_id);
    
    // Eliminar la contraseña antes de firmar el JWT
    delete updatedAccount.account_password;

    // Crear un nuevo JWT con los datos actualizados
    const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

    // Configurar la cookie con el nuevo JWT
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

    // Mensaje de éxito y redirección
    req.flash("notice", "Account updated successfully");
    res.redirect("/account/");
  } else {
    // En caso de error, recargar el formulario con los datos ingresados
    req.flash("notice", 'Sorry, there was an error processing the update.')
        res.status(500).redirect("/account/update")
  }
}



async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;
  const hashedPassword = await bcrypt.hash(account_password, 10);
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
  if (updateResult) {
    req.flash("notice", "Password changed successfully");
    res.redirect("/account/");
  } else {
    const accountData = await accountModel.getAccountById(account_id);
    req.flash("notice", "Password change failed");
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id
    });
  }
}


/* ****************************************
 *  Process logout 
 * ************************************ */
async function accountLogout(req, res, next, params = {}) {
  res.clearCookie("jwt");
  req.flash("notice", "You have successfully logged out.");
  return res.redirect("/")
}
module.exports = { buildLogin, buildRegister, accountManagement, registerAccount,buildUpdateAccountView, accountLogin ,updateAccount,changePassword, accountLogout}