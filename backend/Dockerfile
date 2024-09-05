# build source

FROM node:18 as source
LABEL maintainer="Dawid Mszanowski <dmszanowski@icloud.com>"

WORKDIR /opt/source

COPY ./source/package*.json     ./
RUN npm install
RUN npm install --platform=linux --arch=x64 sharp

COPY ./source/src               ./src
COPY ./source/tsconfig*.json    ./

RUN npm run build

EXPOSE 3000


# build distribution image

FROM node:18
LABEL maintainer="Dawid Mszanowski <dmszanowski@icloud.com>"

WORKDIR /opt/source

COPY --from=source /opt/source/node_modules     ./node_modules
COPY --from=source /opt/source/package.json     ./
COPY --from=source /opt/source/tsconfig.json    ./

COPY --from=source /opt/source/dist             ./dist
COPY --from=source /opt/source/src              ./src

RUN npm prune --production

EXPOSE 3000

ENTRYPOINT [ "sh", "-c", "npm run start:prod" ]


