FROM node:22-alpine AS build
WORKDIR /library
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run docs:build

FROM nginx:alpine
COPY --from=build /library/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
