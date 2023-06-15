FROM node:20.0.0 AS builder
WORKDIR /frontend
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \ 
yarn install --frozen-lockfile
COPY . .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \ 
yarn build

FROM node:20.0.0-alpine AS runner
WORKDIR /frontend
COPY --from=builder /frontend/.next ./.next
COPY --from=builder /frontend/package.json ./package.json
COPY --from=builder /frontend/yarn.lock ./yarn.lock
COPY --from=builder --chown=node:node /frontend/public ./public
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \ 
yarn install --production --frozen-lockfile
CMD ["yarn", "start"]
