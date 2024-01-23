const pool = require('../services/db');

const createNewUser = async (id, userName, accessToken) => {
    try { 
      const res = await pool.query(
        "INSERT INTO users(id, user_name, access_token) VALUES($1, $2, $3) RETURNING *",
        [id, userName, accessToken]
      );
      return console.log(res.rows[0]);
    } catch (error) {
      console.log(error);
      return;
    }
};

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


module.exports={createNewUser, getUserById};