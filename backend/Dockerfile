# Use a small, efficient Node image
FROM node:20-bookworm-slim

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install system libs expected by Prisma on Debian, then deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install

# Copy Prisma schema early and generate client for container target
COPY prisma ./prisma
RUN npx prisma generate

# Copy all backend source code
COPY . .

# Expose API port
EXPOSE 4000

# Start the backend server
CMD ["npm", "run", "start"]
