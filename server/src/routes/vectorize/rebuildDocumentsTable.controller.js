const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2aGJ3eHNiamlsZ2dseWx1YXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MjQwNTAsImV4cCI6MjAyMTEwMDA1MH0.EVySSW42rwaQPnKojsUdd-3DdEpRDF3XFvI2u9WoHS0";
const supabaseUrl = "https://vvhbwxsbjilgglyluate.supabase.co";
const supabaseRole = 'authenticator';

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to delete and create the documents table
const deleteAndCreateDocumentsTable = async (req, res) => {
  
const { data } = await supabase.auth.getUser()
  console.log('++++++++++++',data);
  try {
    const { data, error } = await supabase.rpc("truncate_documents");

    console.log("Documents table created successfully", data);
    console.log('erorororororororo', error);
    res.json({ message: "Documents table created successfully" });
  } catch (error) {
    console.error("Error deleting/creating documents table:", error);
    res.status(500).json({ error: "failed to truncate documents table" });
  }
};

module.exports = { deleteAndCreateDocumentsTable };
