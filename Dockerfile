FROM node:12-stretch-slim

ENV PORT 3000

# Create app directory
RUN mkdir -p /usr/src/app/qamarflow
WORKDIR /usr/src/app/qamarflow

# Installing dependencies
COPY package.json /usr/src/app/qamarflow
COPY yarn.lock /usr/src/app/qamarflow

RUN yarn install

# Copying source files
COPY . /usr/src/app/qamarflow

CMD ["yarn", "dev"]

EXPOSE 3000
