# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp and native modules
RUN apk add --no-cache \
    g++ \
    make \
    python3 \
    py3-pip \
    libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"] 