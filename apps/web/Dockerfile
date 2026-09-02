FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install --prod=false
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
