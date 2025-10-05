# Use a small, efficient Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code
COPY . .

# Expose API port
EXPOSE 4000

# Start the backend server
CMD ["npm", "run", "start"]
