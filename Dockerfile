FROM node:slim

WORKDIR /app
COPY . .


RUN npm install
RUN node ace build --production
RUN cd build && npm ci --production

ENV NODE_ENV=production
ENV PORT=80
ENV DRIVE_DISK=local
ENV DB_CONNECTION=pg

CMD ["node", "build/server.js"]
EXPOSE 80
