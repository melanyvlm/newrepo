/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities");
const inventoryRoute = require("./routes/inventoryRoute");

/* ***********************
 * View Engine and Templates
 *************************/

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root



/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", baseController.buildHome)
// File Not Found Route - must be last route in list

// Inventory routes
app.use("/inv", inventoryRoute)

// Ruta para generar un error 500 intencional
app.get('/cause-error', (req, res, next) => {
  const err = new Error('This is an intentional 500 error!');
  err.status = 500;
  next(err); // Pasa el error al middleware de manejo de errores
});

// This should be always the last route
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  // Si es un error 500, usa la vista error-500.ejs
  if (err.status === 500) {
    return res.render("errors/error-500", {
      title: "500 - Server Error",
      message: err.message,
      nav
    });
  }

  // Para otros errores (como 404), usa error.ejs
  res.render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    nav
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})