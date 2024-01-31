const client = require('../services/db');

const createNewUser = async (id, userName, accessToken) => {
    try { 
      const res = await client.query(
        "INSERT INTO users(id, user_name, access_token) VALUES($1, $2, $3) RETURNING *",
        [id, userName, accessToken]
      );
      return 
    } catch (error) {
      
      return;
    }
};

const getUserById = async(id) => {
    try {
      const res = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return res.rows[0]
    } catch (error) {
      return;
    }
}


module.exports={createNewUser, getUserById};