import { config } from "dotenv";
config({path: ".config"});

import app from "./src/app.js";
import Docker from 'dockerode';

const docker = new Docker({socketPath: '/var/run/docker.sock'});
docker.ping().then(()=>{
    console.log("Smoothie connected to docker daemon");
}).catch((err)=>{
    console.log("Error connecting to docker: ",err);
    console.log("Exiting...");
    process.exit(1);
});
export {docker};

app.listen(process.env.PORT, () => {
    console.log(`Code Smoothie Server is running on port ${process.env.PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        app.listen(5000, () => {
            console.log(`Code Smoothie Server is running on port 5000`);
        });
    }
});