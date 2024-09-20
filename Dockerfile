# 使用官方 Node.js 镜像
FROM node:14

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用源代码
COPY . .

# 暴露应用运行的端口
EXPOSE 3000

# 定义容器启动时的命令
CMD ["npm", "start"]