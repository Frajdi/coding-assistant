const client = require('../../services/db')


// Function to delete and create the documents table
const deleteAndCreateDocumentsTable = async (req, res) => {
  
  try {
    await client.query('TRUNCATE TABLE DOCUMENTS RESTART IDENTITY;');

    res.json({ message: "Documents table created successfully" });
  } catch (error) {
    console.error("Error deleting/creating documents table:", error);
    res.status(500).json({ error: "failed to truncate documents table" });
  }
};

module.exports = { deleteAndCreateDocumentsTable };
