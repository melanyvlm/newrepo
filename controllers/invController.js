const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  if (data.length === 0) {
    return res.status(404).send("No vehicles found for this classification.");
  }
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Display vehicle details
 * ************************** */
invCont.displayVehicleDetails = async function (req, res) {
  try {
    const vehicleId = req.params.id;
    const vehicleDetails = await invModel.getVehicleDetails(vehicleId);

    if (!vehicleDetails) {
      return res.status(404).send("Vehicle not found");
    }

    const nav = await utilities.getNav();
    const vehicleDetailHTML = await utilities.buildVehicleDetail(vehicleDetails);

    res.render("inventory/detail", {
      title: vehicleDetails.inv_make + ' ' + vehicleDetails.inv_model,
      nav: nav,
      vehicleDetailHTML: vehicleDetailHTML
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
/* ***************************
 *  Render Inventory Management View
 * ************************** */

invCont.renderManagementView = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav: nav,
      message: req.flash("message"),
    });
  } catch (error) {
    console.error("Error loading inventory management page:", error);
    res.status(500).send("Server error");
  }
};

// *******************************************************?????

/* ***************************
 *  Renderizar formulario de agregar clasificación
 * *************************** */
invCont.renderAddClassificationForm = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  });
};

/* ***************************
 *  Procesar nueva clasificación
 * *************************** */
invCont.addClassification = async function (req, res) {
  try {
    console.log(req.body); // Verifica qué datos llegan

    const { classification_name } = req.body;
    const success = await invModel.addNewClassification(classification_name);

    if (success) {
      req.flash("message", "Classification added successfully!");
      return res.redirect("/inv/management");
    } else {
      req.flash("message", "Error adding classification.");
      return res.redirect("/inv/add-classification");
    }
  } catch (error) {
    console.error("Error in addClassification:", error);
    req.flash("message", "Server error.");
    return res.redirect("/inv/add-classification");
  }
};

invCont.renderAddInventoryForm = async function (req, res, next) {
  try {
    const classificationData = await invModel.getClassifications();
    const nav = await utilities.getNav();
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classifications: classificationData.rows
    });
  } catch (error) {
    console.error('Error rendering add inventory form:', error);
    next(error);
  }
};

invCont.addInventory = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;
    
    const success = await invModel.addInventory(classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color);

    if(success){
      req.flash("message", "New Vehicle added successfully!");
      return res.redirect("/inv");
    } else {
      req.flash("message", "Error adding vehicle.");
      return res.redirect("/inv/add-inventory");
    }
  } catch (error) {
    console.error("Error in addInventory:", error);
    req.flash("message", "Server error.");
    return res.redirect("/inv/add-inventory");
  }
};

module.exports = invCont