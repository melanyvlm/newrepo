const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getVehicleById(inv_id) {
  try {
    const data = await pool.query( `SELECT * FROM public.inventory AS i WHERE i.inv_id = $1`, [inv_id] )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error " + error)
  }
}

async function addNewClassification(classification_name) {
  try {
    const sql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING *';
    const result = await pool.query(sql, [classification_name]);

    return result.rowCount > 0; // Retorna true si se insertó correctamente
  } catch (error) {
    console.error("Database error in addNewClassification:", error);
    return false;
  }
}

async function addInventory(vehicleInfo) {
  try {
    const {
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    } = vehicleInfo;

    const sqlQuery = 
      "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description, " +
      "inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) " +
      "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";

    const response = await pool.query(sqlQuery, [
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    ]);

    return response.rows[0];

  } catch (error) {
    console.error("Error inserting vehicle:", error);
    return null;
  }
}






module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addNewClassification, addInventory };



