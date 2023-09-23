# 使用官方 Node.js 14 作为基础镜像
FROM node:14

# 设置工作目录
WORKDIR /opt/node

# 将 package.json 和 package-lock.json 文件复制到工作目录
COPY  ./ .

# 安装应用程序的所有依赖
RUN npm install

# 设置 npm registry
#RUN npm config set registry https://your-registry-url/

# 启动 Node.js 应用程序
CMD [ "npm", "run", "start" ]
