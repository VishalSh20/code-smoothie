import { languageConfigs } from "./execute.config.js";
import fs from "fs";
import path from "path";
import Docker from 'dockerode';
const docker = new Docker({socketPath: '/var/run/docker.sock'});

export default async function runCode(executionInput, base64Encoded=false) {
  console.log("Got execution input, ",executionInput);
  const {code, language, stdin="", timeLimit, memoryLimit, cpuCoreLimit, expectedOutput=null} = executionInput;

  let status = "", error = null;
  let executionData = {};
  const config = languageConfigs[language];
  const encoding = base64Encoded ? "base64" : "utf-8";
  const SRC_PATH = path.join("/tmp","smoothie",Date.now().toString());
  fs.mkdirSync(SRC_PATH, { recursive: true });
  try {  
    fs.writeFileSync(path.join(SRC_PATH,config.fileName), code);
    fs.writeFileSync(path.join(SRC_PATH,"input.txt"), stdin);
    fs.writeFileSync(path.join(SRC_PATH,"stdout.log"), "");
    fs.writeFileSync(path.join(SRC_PATH,"stderr.log"), "");
    fs.writeFileSync(path.join(SRC_PATH,"compilation_error.log"), "");
    // If compilation is required, compile the code
    if (config.needsCompilation) {
      const compileResult = await compileCode(config,SRC_PATH);
      if(!compileResult.success){
        status = compileResult.error.type;
        error = status==='COMPILATION_ERROR' ? null: compileResult.error.message;
        throw new Error("Compilation Failed: "+compileResult.error.message);
      }    
    }
    
    // Execute the code
    const execResult = await executeCode(config, SRC_PATH, timeLimit, memoryLimit,cpuCoreLimit, expectedOutput);
    executionData = execResult.data;
    if(!execResult.success){
      status = execResult.error.type;
      error = status!=='INTERNAL_ERROR' ? null : execResult.error.message;
      throw new Error("Execution Failed: "+execResult.error.message);
    }
    
    const {stdout, stderr, compilation_error} = readFileOutputs(SRC_PATH, encoding);
    fs.rmSync(SRC_PATH, { recursive: true, force: true });
    return {
      status:(!expectedOutput || stdout===expectedOutput) ? "ACCEPTED" : "WRONG_ANSWER",
      stdout,
      stderr,
      compilation_error:config.needsCompilation ? compilation_error : null,
      ...executionData
    }
  
  } catch (err) {
    console.log("Code run failed: ", err.message);
    const {stdout,stderr, compilation_error} = readFileOutputs(SRC_PATH, encoding);
    fs.rmSync(SRC_PATH, { recursive: true, force: true });
    return {
      status:status,
      error,
      stdout,
      stderr,
      compilation_error:config.needsCompilation ? compilation_error : null,
      ...executionData
    }
  }

}
const compileCode = async (config,SRC_PATH) => {
    try {
      const container = await docker.createContainer({
          Image: config.image,
          Cmd: ['sh','-c',config.compileCmd(config.fileName)],
          WorkingDir: "/app",
          HostConfig: {
           Binds:[
              `${SRC_PATH}:/app`
           ]
              // AutoRemove: true,
            }
        });
        await container.start();
      console.log('Compilation started...');
  
      const exitData = await container.wait();
      const exitCode = exitData.StatusCode;
      const errLog = await container.logs({ stdout: false, stderr: true });
      console.log(errLog.toString());
  
      if (exitCode === 0) {
        console.log('Compilation succeeded! Binary saved ');
        return {success:true,error:null};
      }
       else {
        console.log('Compilation Error!');
        return {
          success:false,
          error:{
            type:"COMPILATION_ERROR",
            message:"Compilation failed"
          }};
      }
    } catch (error) {
      console.error('Error during compilation:', error);
      return {
        success:false,
        error:{
          type:"INTERNAL_ERROR",
          message:"Error during compilation: "+error.message 
        }
      }
    }
}

const executeCode = async (config, SRC_PATH, timeLimit, memoryLimit, cpuCoreLimit) => {
  console.log('Executing code...');
  console.log('src path is:', SRC_PATH);

  try {
      const container = await docker.createContainer({
          Image: config.image,
          Cmd: ['sh', '-c', config.runCmd],
          WorkingDir: "/app",
          HostConfig: {
              Binds: [
                  `${SRC_PATH}:/app`
              ],
              Memory: memoryLimit * 1024 * 1024,
              MemorySwap: memoryLimit * 1024 * 1024 * 2,
              CpuPeriod: 100000,
              CpuQuota: cpuCoreLimit * 100000,
          }
      });
      await container.start();
      const startTime = Date.now();

      let timeOutId;
      let timeoutKill = false;
      if (timeLimit > 0) {
          timeOutId = setTimeout(async () => {
              console.log('Time limit exceeded. Killing container...');
              await container.stop();
              timeoutKill = true;
          }, timeLimit * 1000);
      }

      // Track max memory usage
      let maxMemoryUsed = 0;
      const statsStream = await container.stats({ stream: true });
      statsStream.on('data', (chunk) => {
          const stats = JSON.parse(chunk.toString());
          console.log("stats",stats);
          const memoryUsed = stats.memory_stats.usage;
          maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);
      });

      const exitData = await container.wait();
      const exitCode = exitData.StatusCode;
      const endTime = Date.now();
      const executionTime = (endTime - startTime);
      
      // Stop collecting stats
      statsStream.destroy();
      
      if (timeOutId) clearTimeout(timeOutId);
      console.log('Execution status:', exitCode);

      const stderr = fs.readFileSync(path.join(SRC_PATH, "stderr.log"), 'utf-8');
      if (stderr) {
          console.log('Execution Error:', stderr);
      }
      
      let errorType, errorMessage;
      if (timeoutKill) {
          errorType = "TIME_LIMIT_EXCEEDED";
          errorMessage = "Execution timed out!";
      }
      else if (stderr) {
          errorType = config.errorParser(stderr);
          errorMessage = "Execution failed due to error: " + errorType;
      }
      else {
          console.log('Execution succeeded!');
          return {
              success: true,
              error: null,
              data: {
                  time_taken: executionTime,
                  memory_used: Math.round(maxMemoryUsed / (1024 * 1024)) // Convert to MB
              },
          };
      }

      console.error(`Execution failed. Error: ${errorMessage}`);
      return {
          success: false,
          data: {
              time_taken: executionTime,
              memory_used: Math.round(maxMemoryUsed / (1024 * 1024)) // Convert to MB
          },
          error: {
              type: errorType,
              message: errorMessage,
          },
      };
  } catch (error) {
      console.error('Error during execution:', error);
      return {
          success: false,
          error: {
              type: "INTERNAL_ERROR",
              message: "Error during execution: " + error.message
          }
      }
  }
}

function readFileOutputs(SRC_PATH, encoding){
    const stdout = fs.readFileSync(path.join(SRC_PATH,"stdout.log"), encoding);
    const stderr = fs.readFileSync(path.join(SRC_PATH,"stderr.log"), encoding);
    const compilation_error = fs.readFileSync(path.join(SRC_PATH,"compilation_error.log"), encoding);
    return {
        stdout:encoding==='utf-8' ? sanitiseString(stdout) : stdout,
        stderr:encoding==='utf-8' ? sanitiseString(stderr) : stderr,
        compilation_error:encoding==='utf-8' ? sanitiseString(compilation_error) : compilation_error,
    }
}

function sanitiseString(str){
    return str.replace(/[\x00-\x1F\x7F]/g, '');
}