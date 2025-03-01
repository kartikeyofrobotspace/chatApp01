# Use Node.js as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the WebSocket server code
COPY . .

# Expose the WebSocket port
EXPOSE 3001

# Run the WebSocket server
CMD ["node", "server.js"]
