import { config } from "dotenv";
config({path: ".config"});

import app from "./src/app.js";
import Docker from 'dockerode';

const docker = new Docker({socketPath: '/var/run/docker.sock'});
docker.ping().then(()=>{
    console.log("Docker is running");
}).catch((err)=>{
    console.log("Docker is not running");
    console.log(err);
});
export {docker};

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})