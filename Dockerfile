FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Create temp directory
RUN mkdir -p temp_downloads database

CMD ["node", "index.js"]
