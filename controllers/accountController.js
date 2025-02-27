// Needed Resources
const utilities = require("../utilities/")
const accountController = {}
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
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
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Validar que todos los campos estén llenos
  if (!account_firstname || !account_lastname || !account_email || !account_password) {
    req.flash("notice", "Please provide a name, last name, email, and a password.");
    return res.status(400).redirect("/account/register");
  }

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


  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
    if (regResult) {
      req.flash("notice", `Welcome, ${account_firstname}! Your account has been created.`);
      return res.status(201).redirect("/account/login");
    }

    req.flash("notice", "Registration could not be completed.");
    return res.status(500).redirect("/account/register");

  } catch (err) {
    console.error("Error during registration:", err);
    req.flash("notice", "An error occurred. Please try again later.");
    return res.status(500).redirect("/account/register");
  }


}




module.exports = { buildLogin, buildRegister, registerAccount }