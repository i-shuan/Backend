# 從官方 Node.js 基礎映像檔建立
FROM node:14

# 建立 app 目錄
WORKDIR /usr/src/app

# 把 package.json 和 package-lock.json 複製到工作目錄
COPY package*.json ./

# 安裝 app 依賴項
RUN npm install

# 複製應用程式原始碼到工作目錄
COPY . .

# 你的 app 監聽的埠
EXPOSE 8080

# 在容器中運行你的 app
CMD [ "npm", "start" ]
