## Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build --configuration production

## Serve stage
FROM nginx:1.27-alpine

# Render provides $PORT. We'll template the nginx conf at runtime.
ENV PORT=8080

# Remove default config and add our template
RUN rm -f /etc/nginx/conf.d/default.conf || true
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built static files (Angular outputs to dist/frontend/browser)
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 8080

# Start nginx after substituting PORT into the template
CMD sh -c "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"