# syntax=docker/dockerfile:1

##########################
# Development image
##########################
FROM node:20-alpine3.18 AS development

WORKDIR /app

# Prisma needs openssl/libc6-compat on alpine
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable

# Install all deps (including devDependencies: tsx, prisma, typescript, eslint)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5000

# Real env vars (DATABASE_URL, secrets, etc.) should be supplied at runtime
# via `docker run --env-file .env` or a docker-compose env_file, not baked
# into the image. Prisma client is generated on container start so it picks
# up the current schema/env every time.
CMD ["sh", "-c", "pnpm generate && pnpm dev"]
