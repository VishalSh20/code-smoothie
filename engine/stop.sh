#!/bin/bash

if [ -f "engine.pid" ]; then
    ENGINE_PID=$(cat engine.pid)
    echo "Stopping engine with PID: $ENGINE_PID"
    kill $ENGINE_PID || { echo "Failed to stop the engine"; exit 1; }
    rm -f engine.pid
    echo "Engine stopped successfully."
else
    echo "Error: engine.pid file not found. Is the engine running?"
    exit 1
fi
