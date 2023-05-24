# 使用一个基础镜像作为起点
FROM node:14.15.0

# 设置 npm 镜像源为淘宝镜像
#npm config set registry <registry url>

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 到镜像中
COPY package.json .
COPY package-lock.json .


# 安装项目依赖
RUN npm install --production

# 将应用程序文件复制到镜像中
COPY src ./src

# 暴露应用程序需要的端口
EXPOSE 8080

# 定义启动命令
CMD [ "npm", "start" ]
