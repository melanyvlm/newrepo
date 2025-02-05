const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid = '';
  if (data.length > 0) {
    grid = '<div class="vehicle-grid">'; // Usar un contenedor general para la grilla
    data.forEach(vehicle => {
      grid += '<div class="vehicle-card">'; // Tarjeta individual para cada vehículo
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id + '" class="vehicle-link" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
      grid +=    '<img src="' + vehicle.inv_thumbnail + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" class="vehicle-image" />';
      grid +=  '</a>';
      grid +=  '<div class="vehicle-info">';
      grid +=    '<h2 class="vehicle-title">';
      grid +=      '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
      grid +=        vehicle.inv_make + ' ' + vehicle.inv_model;
      grid +=      '</a>';
      grid +=    '</h2>';
      grid +=    '<span class="vehicle-price">$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid +=  '</div>'; // Cierre de vehicle-info
      grid += '</div>'; // Cierre de vehicle-card
    });
    grid += '</div>'; // Cierre de vehicle-grid
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};


module.exports = Util