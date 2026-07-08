# ─── Stage 1: Build ───────────────────────────────────────────────────────────
# Node 22 LTS is required for Angular 20
FROM node:22-alpine AS build

WORKDIR /app

# Copy lock files first so this layer is cached unless dependencies change
COPY package.json package-lock.json ./

# Install exact versions from lockfile (faster and deterministic)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build in production mode (defaultConfiguration is already "production" in angular.json)
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove the default nginx placeholder page
RUN rm -rf /usr/share/nginx/html/*

# Copy the compiled Angular app from the build stage
# Angular 17+ with @angular/build:application outputs to dist/<projectName>/browser
COPY --from=build /app/dist/GAL_LombardUI/browser /usr/share/nginx/html

# Use our custom nginx config (handles SPA routing & compression)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
