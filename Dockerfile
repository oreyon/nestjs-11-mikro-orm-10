# Stage 1: Build the application
FROM node:22.14-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package.json and tsconfig.json files
COPY package*.json ./
COPY tsconfig*.json ./

# Install all dependencies to build the application
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create a smaller image for production
FROM node:22.14-alpine AS production

# Create app directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/dist /app/dist

# Use the custom entrypoint script ping the database before starting the application
COPY entrypoint.sh /app/

RUN npm install --only=production

# Expose the API port
EXPOSE $PORT

# Run the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main.js"]