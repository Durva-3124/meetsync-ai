FROM node:20-slim

WORKDIR /app

# Install unzip for puppeteer chromium extraction
RUN apt-get update && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# Copy package descriptors first to leverage Docker's build cache
COPY package*.json ./

# Install all dependencies (including devDependencies required for compilation)
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the TypeScript project (produces JS files in dist/)
RUN npm run build

# Expose port 5000 as configured in env.ts
EXPOSE 5000

# Start the built production service
CMD ["npm", "start"]
