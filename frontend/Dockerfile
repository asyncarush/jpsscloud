# 1. Base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RpbmctcmFtLTU2LmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_jv2QmwT8rE8S1UXvghpgzEE6eeYjEqCfpYIOdiuW5x
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Install dependencies separately for caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# 2. Build Stage
FROM base AS builder
RUN npm run build

# 3. Production Stage
FROM node:18-alpine AS production

WORKDIR /app

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dHJ1c3RpbmctcmFtLTU2LmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_jv2QmwT8rE8S1UXvghpgzEE6eeYjEqCfpYIOdiuW5x
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Copy only built assets + production deps
COPY --from=base /app/package.json ./
COPY --from=base /app/package-lock.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]
