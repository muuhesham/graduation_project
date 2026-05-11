# Use Node.js 18 Alpine for a lightweight image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using --legacy-peer-deps as used in root)
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Expose the backend port
EXPOSE 8000

# Start development with Prisma client generation
# We use a shell script format to ensure commands run in sequence
CMD npm run prisma:generate && npm run dev
