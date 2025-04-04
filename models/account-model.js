// Importamos la conexión a la base de datos
const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}


/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}
/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}
async function getAccountById(account_id) {
  try {
    const sql =
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1";
    const data = await pool.query(sql, [account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Get Account by ID Error: " + error);
    return null;
  }
}
async function updateAccount(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const data = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Update Account Error: " + error);
    return null;
  }
}

/* ***************************
*  Update Password
* ************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const data = await pool.query(sql, [account_password, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Update Password Error: " + error);
    return null;
  }
}
// Exportamos la función para poder usarla en otros archivos
module.exports = {
  registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccount,
  updatePassword,
};
