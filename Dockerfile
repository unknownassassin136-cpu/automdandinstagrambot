FROM node:20-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy root configurations
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy backend app
COPY apps/backend ./apps/backend

# Install dependencies specifically for backend using filter
RUN pnpm install --filter backend...

# Build the backend
RUN pnpm run --filter backend build

# --- Production Image ---
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and built output from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

# Expose backend port
EXPOSE 3000

# Start command
WORKDIR /app/apps/backend
CMD ["pnpm", "start"]
