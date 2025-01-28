import executionQueue from "../execution/executionQueue.js";
import prisma from "../../prisma/client.js"
import {SUPPORTED_LANGUAGES} from "../../constants.js"
import {v4 as uuidV4} from "uuid"

export const makeSubmission = async (req, res) => {
  let { code,
    language,
    stdin, 
    timeLimit=process.env.DEFAULT_TIME_LIMIT, 
    memoryLimit=process.env.DEFAULT_MEMORY_LIMIT,
    cpuCoreLimit=process.env.DEFAULT_CPU_CORE_LIMIT, 
    expectedOutput="" , 
  } = req.body;
  const base64Encoded = req.query?.base64Encoded || false;
  
  const {error} = checkSubmissionData({code, language, timeLimit, memoryLimit, cpuCoreLimit});
  if(error) {
    return res.status(400).json({ error });
  }
  
  try {
    const executionInput = { code, language, stdin, timeLimit, memoryLimit,cpuCoreLimit, expectedOutput, base64Encoded };
    const submissionId = uuidV4();
    await prisma.execution.create({
      data: {
        token: submissionId,
        status: "QUEUED",
        language:language.toUpperCase(),
        code,
        stdin
      }
    });

    executionQueue.add(executionInput,{
      jobId: submissionId,
      removeOnComplete: true,
      removeOnFail: true,
    });
    res.status(200).json({token:submissionId});
  } catch (error) {
    res.status(500).json({ error: "Could not queue the submission! "+error.message });
  }
}

export const makeBatchedSubmissions = async(req,res)=>{
  const submissions = req.body;
  const base64Encoded = req.query?.base64Encoded || false;
  if(!submissions) {
    return res.status(400).json({ error: "Missing submissions" });
  }
  if(!Array.isArray(submissions)) {
    return res.status(400).json({ error: "Submissions must be an array" });
  }

 try {
   
   const responses = await Promise.all(submissions.map( async (submission) => 
     {
     const {
      code,
      language,
      stdin, 
      timeLimit=process.env.DEFAULT_TIME_LIMIT, 
      memoryLimit=process.env.DEFAULT_MEMORY_LIMIT,
      cpuCoreLimit=process.env.DEFAULT_CPU_CORE_LIMIT, 
      expectedOutput=""} = submission;
      
     const {error} = checkSubmissionData({code, language, timeLimit, memoryLimit, cpuCoreLimit});
     if(error) {
       return {error};
     }
     
     try {
       const executionInput = { code, language, stdin, timeLimit, memoryLimit,cpuCoreLimit, expectedOutput, base64Encoded };
       const submissionId = uuidV4();
       await prisma.execution.create({
         data: {
           token: submissionId,
           status: "QUEUED",
           language:language.toUpperCase(),
           code,
           stdin
         }
       });
 
       executionQueue.add(executionInput,{
          jobId: submissionId,
          removeOnComplete: true,
          removeOnFail: true,
        });
        return {token:submissionId};
     }
     catch (error) {
       return {error: "Could not queue the submission! "+error.message};
     }
   }));
 
   return res.status(200).json(responses);
   
 } catch (error) {
   return res.status(500).json({ error: "Could not queue the submissions!"+error.message });
 }
  
}

export const getSubmissionStatus  = async (req, res) => {
  const tokens = req.query.token;
  if(!tokens) {
    return res.status(400).json({ error: "Missing token" });
  }
  try { 
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
    const submissions = await Promise.all(tokenArray.map(async (token) => {
      const submission = await prisma.execution.findUnique({
        where: {
          token
        }
      });
      if(!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      return submission;
    }));
    return res.status(200).json(submissions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not get submission status: "+error.message });
  }
}


function checkSubmissionData(submission) {
  if(!submission.code || !submission.language || !submission.timeLimit || !submission.memoryLimit || !submission.cpuCoreLimit) {
    return {error: "Missing required fields"};
  }

  submission.timeLimit = parseInt(submission.timeLimit);
  submission.memoryLimit = parseInt(submission.memoryLimit);
  submission.cpuCoreLimit = parseInt(submission.cpuCoreLimit);

  if(!SUPPORTED_LANGUAGES.includes(submission.language)) {
    return {error: "Unsupported language"};
  }
  if(submission.timeLimit<30 || submission.timeLimit>(process.env.MAX_TIME_LIMIT)) {
    return {error: `Time limit must be between 30 and ${process.env.MAX_TIME_LIMIT} seconds`};
  }
  if(submission.memoryLimit<128 || submission.memoryLimit>(process.env.MAX_MEMORY_LIMIT)) {
    return {error: `Memory limit must be between 128 and ${process.env.MAX_MEMORY_LIMIT} MB`};
  }
  if(submission.cpuCoreLimit<1 || submission.cpuCoreLimit>(process.env.MAX_CPU_CORE_LIMIT)) {
    return {error: `CPU core limit must be between 1 and ${process.env.MAX_CPU_CORE_LIMIT}`};
  }
  return {success: true};
}