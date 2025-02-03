import { config } from "dotenv";
config({path: ".config"});

import Queue from "bull";
import runCode from "./execute.functions.js";
import prisma from "../../prisma/client.js";

const executionQueue = new Queue("execution", {
  redis: {
    port: process.env.REDIS_PORT,
    host: "localhost",
    password: process.env.REDIS_PASSWORD
  },
  limiter: {
    max: process.env.MAX_JOB_QUEUE_SIZE, 
    duration: 1000, 
    bounceBack: false 
  }
});

executionQueue.process(async (job) => {
  try {
    const { code, language, stdin, timeLimit, memoryLimit, expectedOutput, base64Encoded } = job.data;
    
    await prisma.execution.update({
      where: { token: job.id },
      data: { status: "EXECUTING" }
    });

    const executionInput = { code, language, stdin, timeLimit, memoryLimit, expectedOutput };
    const result = await runCode(executionInput, base64Encoded);
    console.log("Got execution results, ", result);

    // Update with final result
    await prisma.execution.update({
      where: { token: job.id },
      data: {
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        compilation_output: result.compilation_error,
        time_taken: result.time_taken || null,
        memory_used: result.memory_used || null,
      }
    });

    return result;
  } catch (error) {
    await prisma.execution.update({
      where: { token: job.id },
      data: {
        status: "INTERNAL_ERROR",
        error: error.message
      }
    });
    throw error;
  }
});

export default executionQueue;