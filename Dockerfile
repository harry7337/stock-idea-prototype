# Use an official minimal Node.js image as the build environment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package.json .
# If you have a lock file, uncomment the next line
# COPY package-lock.json .

# Install dependencies
RUN npm i

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Ensure all public assets (like logo.png) are present in dist
RUN cp -r public/* dist/ || true

# Use a minimal Nginx image to serve the static files
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
