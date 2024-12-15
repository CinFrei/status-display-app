FROM node:18-alpine

# Set ownership before switching user
WORKDIR /home/node/app
COPY package*.json ./
RUN npm install # Install dependencies as root

# Switch to a non-root user
USER node
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
