// Importamos la conexión a la base de datos
const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

async function getAccountByEmail(email) {
    try {
      const sql = "SELECT * FROM account WHERE account_email = $1";
      const result = await pool.query(sql, [email]);
      return result.rows[0]; // Devuelve el primer resultado (si existe)
    } catch (error) {
      console.error("Database error:", error);
      return null;
    }
  }
// Exportamos la función para poder usarla en otros archivos
module.exports = { registerAccount ,checkExistingEmail, getAccountByEmail };
