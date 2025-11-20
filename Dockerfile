# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig*.json ./
COPY . .
RUN npm ci --silent
RUN npm run build

# Production stage: serve static files with a minimal http server
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: expose port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]