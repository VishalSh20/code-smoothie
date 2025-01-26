import runCode from "../execution/execute.functions.js";

export const makeSubmission = async (req, res) => {
  const { code, language, stdin, timeLimit, memoryLimit, expectedOutput } = req.body;
  console.log(code, language, stdin, timeLimit, memoryLimit, expectedOutput);
  try {
    const executionInput = { code, language, stdin, timeLimit, memoryLimit, expectedOutput };
    const result = await runCode(executionInput,false);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}