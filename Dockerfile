FROM node:slim as builder

WORKDIR /app
COPY . .


RUN npm install && node ace build --production && cd build && npm ci --production

FROM node:slim

WORKDIR /app
COPY --from=builder /app/build .

ENV NODE_ENV=production
ENV PORT=80
ENV DRIVE_DISK=local
ENV DB_CONNECTION=pg

CMD ["node", "server.js"]
EXPOSE 80
