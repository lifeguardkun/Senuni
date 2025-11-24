FROM node:20
WORKDIR /app
COPY my-next-app/package*.json ./
RUN npm install