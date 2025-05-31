# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy remaining files
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the bot
CMD ["node", "Op_poll.js"]
