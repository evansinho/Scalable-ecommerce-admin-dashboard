FROM node:18

WORKDIR /app/apps/api

COPY apps/api/package*.json ./

RUN npm install

COPY apps/api/ .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
