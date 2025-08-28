# ⚡ STAGE 1: Build the Vite application
FROM node:21-slim AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Declare build argument
ARG VITE_SERVER_URL

# Set environment variable based on build argument
ENV VITE_SERVER_URL=${VITE_SERVER_URL}

# Build the Vite app
RUN npm run build

# ⚡ STAGE 2: Serve with Nginx
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built files from builder stage
COPY --from=builder /app/dist .

# Create a simple Nginx config file dynamically
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html =404; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
