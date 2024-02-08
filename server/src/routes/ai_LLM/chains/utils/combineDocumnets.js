const combineDocuments = (docs) => {
    return docs.map((doc) => doc.content).join("\n\n");
};

module.exports = combineDocuments;