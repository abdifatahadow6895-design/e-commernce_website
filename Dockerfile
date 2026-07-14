FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm install --prefix backend
COPY backend ./backend
RUN npm --prefix backend run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
