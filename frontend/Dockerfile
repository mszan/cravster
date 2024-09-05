# build source

FROM node:18 as source
LABEL maintainer="Dawid Mszanowski <dmszanowski@icloud.com>"

ARG REACT_APP_HOST_ENV
ARG NPM_CONFIG_LOGLEVEL

WORKDIR /opt/source

COPY ./source/package*.json     ./
RUN npm install

COPY ./source/src               ./src
COPY ./source/public            ./public
COPY ./source/tsconfig*.json    ./

RUN npm run build

# build distribution image

FROM node:18-alpine
LABEL maintainer="Dawid Mszanowski <dmszanowski@icloud.com>"

WORKDIR /opt/source

COPY --from=source /opt/source/build ./build
RUN npm install -g serve

EXPOSE 80

ENTRYPOINT [ "serve", "-s", "build" , "-l", "80"]

