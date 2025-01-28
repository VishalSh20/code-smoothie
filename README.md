# Code Smoothie

Code Smoothie is a Node.js-based code execution engine that leverages Docker (via Dockerode) to execute code in a secure and isolated environment. It supports multiple languages, including C, C++, Java, Python, and JavaScript, and ensures seamless error detection and parsing. Ideal for online judge systems or coding platforms.

## Features
- Language support: C, C++, Java, Python, and JavaScript.
- Docker-based isolation for secure execution.
- Error parsing with categorized error types for better debugging.
- Extensible architecture for additional language support.

## Installation Guide
Follow the steps below to set up and run Code Smoothie:

### Prerequisites
1. **Docker**
   - Install Docker by following the official guide: [Install Docker](https://docs.docker.com/get-docker/).
   - If you are on Linux:
     - Add your user to the Docker group to run Docker without `sudo`:
       ```bash
       sudo usermod -aG docker $USER
       ```
     - Reboot your system to apply the changes.

2. **Redis and PostgreSQL**
   - You can either install Redis and PostgreSQL locally or set them up using Docker:
     ```bash
     docker run --name my-redis \
     -e REDIS_PASSWORD=password \
     -p 6379:6379 redis redis-server --requirepass password 
     
      docker run -d --name postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB \
     -p 5432:5432 postgres:latest
     ```

### Clone the Repository
```bash
git clone https://github.com/VishalSh20/code-smoothie.git
cd code-smoothie
```

### Configuration
1. Set up the `.config` file for application settings:
   ```bash
   cat .config
   ```
2. Set config as environment variable source:
   ```bash
   source .config
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure PostgreSQL with Prisma:
   ```bash
   export DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?schema=public"
   npx prisma generate
   npx prisma db push
   ```

### Start the Engine
1. Navigate to the engine directory:
   ```bash
   cd engine
   ```
2. Make the entry and stop scripts executable:
   ```bash
   chmod +x entrypoint.sh
   chmod +x stop.sh
   ```

3. Use the provided `entrypoint.sh` to set up and run the engine:
   ```bash
   ./entrypoint.sh
   ```
- This script will pull the necessary Docker images and start the node js application. By default, the application will run at `http://localhost:8088`.

4. To stop the engine, use the `stop.sh` script:
   ```bash
   ./stop.sh
   ```