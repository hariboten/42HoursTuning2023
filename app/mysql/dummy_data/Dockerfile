FROM node:20.0.0 AS builder
WORKDIR /create_init_data
COPY . .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \ 
yarn install --frozen-lockfile && yarn build

FROM node:20-slim AS runner
WORKDIR /create_init_data
COPY --from=builder /create_init_data/dist ./dist
COPY --from=builder /create_init_data/package* ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn/v6 \ 
yarn install --production --frozen-lockfile
