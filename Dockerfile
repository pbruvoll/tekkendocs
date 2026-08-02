FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:24-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:24-alpine
COPY ./package.json package-lock.json server.js instrumentation.server.mjs /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
# The Prisma client is generated at install time from prisma/schema.prisma, which
# the production-dependencies stage never copies, so its postinstall skips generation.
# Overlay the client generated in the (alpine) dev-deps stage so the runtime image
# ships a working, musl-native client.
COPY --from=development-dependencies-env /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]
