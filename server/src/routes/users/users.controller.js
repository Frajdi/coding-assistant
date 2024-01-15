const pool = require("../../services/db");


const getUserById = async(id) => {
    try {
      const res = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      console.log(res.rows[0]);
      return res.rows[0]
    } catch (error) {
      console.log(error);
      return;
    }
}

module.exports = {getUserById};