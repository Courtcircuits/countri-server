FROM node:slim

WORKDIR /app
COPY . .


RUN npm install
RUN node ace build --production
RUN cd build && npm ci --production

ENV NODE_ENV=production
ENV PORT=80
ENV HOST=0.0.0.0
ENV APP_KEY=8cgLBsbLt8ACL3qr0iTnYkli6FYLnoxp
ENV DRIVE_DISK=local
ENV DB_CONNECTION=pg
ENV PG_HOST=postgresql.local
ENV PG_PORT=5432
ENV PG_USER=postgres
ENV PG_PASSWORD=qoicoubeh
ENV PG_DB_NAME=ratathune

CMD ["node", "build/server.js"]
EXPOSE 80
