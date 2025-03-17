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
    const vehicle = await invModel.getVehicleById(req.params.id);
    if (!vehicle) {
      let nav = await utilities.getNav()
      return res.render("./errors/error", {
        title: "404 Error",
        status: 404,
        message: "Vehicle not found.",
        nav
      });
    }

    const html = utilities.buildVehicleDetail(vehicle);
    let nav = await utilities.getNav()
    res.render("./inventory/detail", { 
      title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
      nav,
      vehicle: html 
    });
    
  } catch (error) {
    console.error("Error in getVehicleDetails:", error);
    let nav = await utilities.getNav()
    res.status(500).render("./errors/error", {
      title: "500 Error",
      status: 500,
      message: "An error occurred while fetching vehicle details.",
      nav
    });
  }
}
/* ***************************
 *  Render Inventory Management View
 * ************************** */

invCont.renderManagementView = async function (req, res) {

  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList
  });
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
  const { classification_name } = req.body;
  try {
    const result = await invModel.addNewClassification(classification_name);
    if (result) {
      let nav = await utilities.getNav();
      req.flash("notice", "Classification added successfully!");
      res.redirect("/inv/");
    } else {
      let nav = await utilities.getNav();
      req.flash("notice", "Could not add classification.");
      res.status(501).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        classification_name
      });
    }
  } catch (error) {
    let nav = await utilities.getNav();
    req.flash("notice", "Error adding classification.");
    res.status(500).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      classification_name
    });
  }
};

invCont.renderAddInventoryForm = async function (req, res) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null
  })
}

invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  } = req.body;
  const invData = {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  };

  try {
    const inventoryResult = await invModel.addInventory(invData);
    if (inventoryResult) {
      req.flash("message", "Inventory item added successfully!");
      res.redirect("/inv/");
    } else {
      const classificationList = await utilities.buildClassificationList(classification_id || null);
      req.flash("message", "Failed to add inventory item or vehicle already exists.");
      res.status(501).render("inventory/add-inventory", {
        title: "Add Inventory",
        errors: null,
        nav,
        classificationList,
        ...invData
      });
    }
  } catch (error) {
    const classificationList = await utilities.buildClassificationList(classification_id || null);
    req.flash("message", "An error occurred while adding the inventory item.");
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      errors: null,
      nav,
      classificationList,
      ...invData
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}
/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-vehicle", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}
/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
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
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}
module.exports = invCont