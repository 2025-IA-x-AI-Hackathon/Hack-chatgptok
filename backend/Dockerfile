# Stage 1: Dependencies
FROM node:21-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:21-alpine AS runner
WORKDIR /usr/src/app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p /usr/src/app/logs && \
    chown -R nodejs:nodejs /usr/src/app/logs

# Switch to non-root user
USER nodejs

# Expose port (will be overridden by docker-compose or env var)
EXPOSE 8000

# Start application
CMD ["npm", "start"]