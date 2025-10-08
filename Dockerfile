FROM node:20
WORKDIR /app
COPY next-app/package*.json ./
RUN npm install