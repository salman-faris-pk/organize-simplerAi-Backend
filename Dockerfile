# BUILDER
FROM node:22-slim AS builder

WORKDIR /app


COPY package*.json ./
COPY drizzle.config.* ./

RUN npm ci

COPY . .

RUN npm run build

# PRODUCTION

FROM node:22-slim AS production

WORKDIR /app

# Create non-root user FIRST
RUN groupadd -g 1001 appuser && \
     useradd -u 1001 -g appuser -s /bin/bash -m appuser

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*


COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/package*.json ./
COPY --from=builder --chown=appuser:appuser /app/drizzle.config.* ./

# Switch to non-root user
USER appuser

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
# CMD [ "npm","run","start:prod"]




