FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy source
COPY backend/ .

EXPOSE 5000

CMD ["node", "src/server.js"]
