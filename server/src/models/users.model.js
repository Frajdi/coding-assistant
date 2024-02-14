const client = require('../services/db');

const createNewUser = async (id, userName, accessToken) => {
    try { 
      const res = await client.query(
        `INSERT INTO users(user_id, user_name, access_token)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id)
             DO UPDATE SET access_token = EXCLUDED.access_token
             RETURNING *`,
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
        'SELECT * FROM users WHERE user_id = $1',
        [id]
      );
      return res.rows[0]
    } catch (error) {
      return;
    }
}


module.exports={createNewUser, getUserById};