# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Enable Yarn 4 via corepack
RUN corepack enable

# Install dependencies (layer-cached)
COPY package.json yarn.lock ./
COPY .yarn .yarn
RUN yarn install --immutable

# Build the app
COPY . .
RUN yarn build

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:alpine AS serve

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template and entrypoint
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /etc/nginx/snippets

EXPOSE 9052 9053

ENTRYPOINT ["/entrypoint.sh"]
