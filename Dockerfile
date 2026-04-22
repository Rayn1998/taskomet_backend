FROM node:24-alpine3.23

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm i

COPY . .

WORKDIR /app/backend

CMD ["npm", "run", "dev"]