const getResponseChain = require('./chains/getResponse.chain');

const getAnswer = async (question, conv_history) => {
  const response = await getResponseChain.invoke({
    question,
    conv_history,
  });

  return response;
};

const retrieveAIResponse = async (req, res) => {
  try {
    const { question, conv_history } = req.body;
    const aiResponse = await getAnswer(question, conv_history);
    res.json(aiResponse);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  retrieveAIResponse,
};
