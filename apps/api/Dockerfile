FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install --prod=false
COPY . .
RUN pnpm build
EXPOSE 4000
CMD ["pnpm", "dev"]
