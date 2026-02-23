# مرحلة البناء
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# مرحلة التشغيل
FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g sirv-cli

COPY --from=build /app/dist ./dist

EXPOSE 80

CMD ["sirv", "dist", "--port", "80", "--host", "0.0.0.0", "--single"]
