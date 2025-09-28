# Use Node.js v20 (alpine = small image)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy all source code
COPY . .

# Expose the app port (Render sets PORT env var automatically)
EXPOSE 4000

# Start the app
CMD ["npm", "start"]
