# Multi-stage build for Angular app
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular app
RUN npm run build --configuration=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built app from build stage - only the browser files
COPY --from=build /app/dist/municipality-frontend/browser/index.html ./
COPY --from=build /app/dist/municipality-frontend/browser/*.js ./
COPY --from=build /app/dist/municipality-frontend/browser/*.css ./
COPY --from=build /app/dist/municipality-frontend/browser/favicon.ico ./
COPY --from=build /app/public/_redirects ./

# Clean up any extra files that might have been copied
RUN ls -la

# Install serve globally (better for SPAs)
RUN npm install -g serve

# Expose port (Render will set PORT environment variable)
EXPOSE 8080

# Start the server with SPA support
CMD ["sh", "-c", "serve -s . -l $PORT"]