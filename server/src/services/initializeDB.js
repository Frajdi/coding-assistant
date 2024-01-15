const pool = require("./db");

const initializeDatabse = async () => {
    try {
      await pool.query(
        "CREATE TABLE IF NOT EXISTS users(id INT, user_name VARCHAR(50), access_token VARCHAR(50))"
      );
      console.log("Database Ready");
      return;
    } catch (error) {
      console.log(error);
      return;
    }
};

module.exports = initializeDatabse;