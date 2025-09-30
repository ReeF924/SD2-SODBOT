FROM node:20-slim

#for the puppeteer dependency
#RUN apt-get update && apt-get install -y \
#    ca-certificates \
#    fonts-liberation \
#    libasound2 \
#    libatk1.0-0 \
#    libatk-bridge2.0-0 \
#    libcairo2 \
#    libcups2 \
#    libdrm2 \
#    libdbus-1-3 \
#    libgbm1 \
#    libgtk-3-0 \
#    libnss3 \
#    libnspr4 \
#    libx11-xcb1 \
#    libxcomposite1 \
#    libxcursor1 \
#    libxdamage1 \
#    libxi6 \
#    libxrandr2 \
#    libxss1 \
#    libxtst6 \
#    wget \
#    xdg-utils \
#    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD ["npm","start"]