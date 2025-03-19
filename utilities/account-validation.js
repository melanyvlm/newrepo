const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const invModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
    return [
        // Valid email is required
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required."),

        // Password is required
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required."),
    ]
}

/* ******************************
* Check login data and return errors or continue
* ***************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email
        })
        return
    }
    next()
}



/* **********************************
 *  Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
      // classification_name is required and must be alphabetic
      body("classification_name")
        .trim()
        .notEmpty()
        .withMessage("Please provide a classification name.") // Mensaje de error
        .matches(/^[A-Za-z]+$/) // Solo caracteres alfabéticos
        .withMessage("Please provide a classification name with alphabetic characters only.") // Mensaje de error

    ];
  };
  
  /* ******************************
   * Check data and return errors or continue to add classification
   * ***************************** */
  validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("inventory/add-classification", {
        errors: errors.array(),
        title: "Add New Classification",
        nav,
        classification_name
      });
      return;
    }
    next();
  };
  
  /* ******************************
 *  Inventory Validation Rules
 * ***************************** */
validate.inventoryRules = () => {
    return [
      body("classification_id")
        .trim()
        .notEmpty()
        .withMessage("Please select a classification."),
  
      body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Make is required."),
  
      body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Model is required."),
  
      body("inv_year")
      .trim()
       .escape()
      .notEmpty()
      .withMessage("Please provide the year of the vehicle.")
      .isLength({ min: 4, max: 4 }),
  
      body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Color is required."),
  
      body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Description is required."),
  
      body("inv_image")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Image path is required."),
  
      body("inv_thumbnail")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Thumbnail path is required."),
  
      body("inv_price")
        .trim()
        .escape()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number."),
  
      body("inv_miles")
        .trim()
        .escape()
        .isInt({ min: 0 })
        .withMessage("Miles must be a non-negative integer."),
    ]
  }
  
  /* ******************************
   * Check Inventory Data and return errors or continue to addition
   * ***************************** */
  validate.checkinvData = async (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const classificationList = await utilities.buildClassificationList(req.body.classification_id);
        const { inventory_data } = req.body;
        res.render("inventory/add-inventory", {
            errors: errors.array(),
            title: "Add Inventory",
            nav,
            classificationList,
            inventory_data
        });
        return;
    }
    
    next();
};

validate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_id, 
    inv_make, 
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id 
  } = req.body
  const errors = validationResult(req) 
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    const title = `${inv_make} ${inv_model}`
    return res.render("inventory/edit-vehicle", { 
      title: "Edit " + title,
      nav,
      classificationList, 
      errors: errors.array(), 
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    })
  }
  next()
}
validate.checkUpdateAccountData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;
  let nav = await utilities.getNav();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
  }
  next();
};
validate.updateInventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Make is required."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model is required."),

    body("inv_year")
    .trim()
     .escape()
    .notEmpty()
    .withMessage("Please provide the year of the vehicle.")
    .isLength({ min: 4, max: 4 }),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Image path is required."),

    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Thumbnail path is required."),

    body("inv_price")
      .trim()
      .escape()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("inv_miles")
      .trim()
      .escape()
      .isInt({ min: 0 })
      .withMessage("Miles must be a non-negative integer."),
  ]
}

validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 }),
    body("account_lastname")
      .trim()
      .isLength({ min: 1 }),
    body("account_email").trim().isEmail().withMessage("Valid email required"),
    body("account_id").isInt().withMessage("Invalid account ID"),
  ];
};


validate.changePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isLength({ min: 8 })
      .withMessage(
        "Password must be 8+ characters with 1 number, 1 capital, 1 special character"
      ),
    body("account_password_confirmation")
      .trim()
      .custom((value, { req }) => value === req.body.account_password)
      .withMessage("Passwords must match"),
    body("account_id").isInt().withMessage("Invalid account ID"),
  ];
};

validate.checkPasswordData = async (req, res, next) => {
  const { account_password, account_password_confirmation, account_id } = req.body;
  let nav = await utilities.getNav();
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
    });
  }
  next();
};

module.exports = validate