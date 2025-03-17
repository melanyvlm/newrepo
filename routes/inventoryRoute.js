// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validate = require("../utilities/account-validation"); // Importar validaciones
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New route to show details of a vehicle 
router.get("/detail/:id", invController.displayVehicleDetails);

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
router.get('/', invController.renderManagementView);
// Add new classification


// Ruta para mostrar el formulario de agregar clasificación
router.get("/add-classification", invController.renderAddClassificationForm);
router.post(
  "/add-classification",
  validate.classificationRules(), // Validación de datos
  validate.checkClassificationData, // Verificar errores
  utilities.handleErrors(invController.addClassification) // Procesar si no hay errores
);

router.get('/add-inventory', invController.renderAddInventoryForm);
router.post(
  "/add-inventory",
  validate.inventoryRules(), // Validación de datos
  validate.checkinvData, // Verificar errores
  utilities.handleErrors(invController.addInventory) // Procesar si no hay errores
);

router.get("/edit/:id", utilities.handleErrors(invController.editInventoryView));
module.exports = router;
