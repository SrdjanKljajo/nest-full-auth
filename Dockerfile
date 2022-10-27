#############################
# BUILD FOR LOCAL DEVELOPMENT
#############################

FROM node:18-alpine As development

# Create app directory
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci

# Bundle app source
COPY . .

######################
# BUILD FOR PRODUCTION
######################

FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we run `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --from=development /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible

RUN npm ci --omit=dev && npm cache clean --force

############
# PRODUCTION
############

FROM node:18-alpine AS production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3333
# new migrate and start app script
CMD [  "npm", "run", "start:migrate:prod" ]
