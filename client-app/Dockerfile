FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install with optional dependencies handling
RUN npm ci && npm rebuild

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html
 
COPY --from=build /app/public/assets/icons /usr/share/nginx/html/assets/icons
COPY --from=build /app/public/assets/images /usr/share/nginx/html/assets/images

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]