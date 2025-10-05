#!/bin/bash

COMMAND=$1
PROFILE=${2:-dev}  # Default to 'dev' if no profile argument is given

case $COMMAND in
    start)
        echo "🚀 Building and starting Docker Compose stack with profile: $PROFILE..."
        docker compose --profile $PROFILE up --build -d
        ;;
    restart)
        echo "🔄 Restarting Docker Compose stack with profile: $PROFILE..."
        docker compose --profile $PROFILE down
        docker compose --profile $PROFILE up --build -d
        ;;
    stop)
        echo "🛑 Stopping Docker Compose stack with profile: $PROFILE..."
        docker compose --profile $PROFILE down
        ;;
    status)
        echo "📊 Showing status of Docker Compose stack with profile: $PROFILE..."
        docker compose --profile $PROFILE ps
        ;;
    *)
        echo "Usage: $0 {start|restart|stop|status} [profile]"
        echo "Example: $0 start dev"
        echo "Example: $0 start prod"
        exit 1
        ;;
esac
