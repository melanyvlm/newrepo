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
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id)
  if (data.length === 0) {
    return res.status(404).send("No vehicles found for this classification.");
  }
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};


/* ***************************
 *  Display vehicle details
 * ************************** */
/* ***************************
 *  Display vehicle details
 * ************************** */
invCont.displayVehicleDetails = async function (req, res) {
  try {
    const vehicleId = req.params.id; // Obtener el id del vehículo desde la URL
    const vehicleDetails = await invModel.getVehicleDetails(vehicleId); // Obtener los detalles del vehículo
    
    // Si el vehículo no existe, mostrar un mensaje de error
    if (!vehicleDetails) {
      return res.status(404).send("Vehicle not found");
    }
    
    // Obtener la navegación
    let nav = await utilities.getNav();
    
    res.render('inventory/detail', {
      title: vehicleDetails.inv_make + ' ' + vehicleDetails.inv_model,  // Titulo con la marca y modelo
      vehicle: vehicleDetails,  // Pasar los detalles del vehículo
      nav: nav
    });
    
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};



module.exports = invCont