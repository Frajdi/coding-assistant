const pool = require("./db");

const initializeDatabse = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await pool.query(
      "CREATE TABLE IF NOT EXISTS users(id INT, user_name VARCHAR(50), access_token VARCHAR(50))"
    );
    await pool.query(
      `CREATE TABLE IF NOT EXISTS
        DOCUMENTS (
          ID BIGSERIAL PRIMARY KEY,
          CONTENT TEXT, 
          METADATA JSONB,
          EMBEDDING VECTOR (1536)
        );`
    );
    await pool.query(
      `
      CREATE OR REPLACE FUNCTION MATCH_DOCUMENTS (
        QUERY_EMBEDDING VECTOR (1536),
        MATCH_COUNT INT DEFAULT NULL,
        FILTER JSONB DEFAULT '{}'
      ) RETURNS TABLE (
        ID BIGINT,
        CONTENT TEXT,
        METADATA JSONB,
        EMBEDDING JSONB,
        SIMILARITY FLOAT
      ) LANGUAGE PLPGSQL AS $$
      #VARIABLE_CONFLICT USE_COLUMN
      BEGIN
        RETURN QUERY
        SELECT
          ID,
          CONTENT,
          METADATA,
          (EMBEDDING::TEXT)::JSONB AS EMBEDDING,
          1 - (DOCUMENTS.EMBEDDING <=> QUERY_EMBEDDING) AS SIMILARITY
        FROM DOCUMENTS
        WHERE METADATA @> FILTER
        ORDER BY DOCUMENTS.EMBEDDING <=> QUERY_EMBEDDING
        LIMIT MATCH_COUNT;
      END;
      $$;            
      `
    );
    console.log("Database Ready");
    return;
  } catch (error) {
    console.log(error);
    return;
  }
};

module.exports = initializeDatabse;
