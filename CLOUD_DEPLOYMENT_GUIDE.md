# 云服务器部署指南

## 🚀 部署前准备

### 1. 本地清理 (可选)
如果你想在本地清理PM2:
```bash
# 完全清理本地PM2
./pm2-manager.sh cleanup
```

### 2. 准备部署配置
```bash
# 生成生产环境配置
./pm2-manager.sh deploy-prep
```

## 🌐 云服务器部署步骤

### 步骤1: 服务器环境准备
```bash
# 在云服务器上安装Node.js和PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 全局安装PM2
sudo npm install -g pm2

# 设置PM2开机自启
pm2 startup
# 按照提示执行sudo命令
```

### 步骤2: 上传项目代码
```bash
# 方式1: 使用Git (推荐)
git clone your-repo-url /var/www/timee
cd /var/www/timee

# 方式2: 使用SCP上传
scp -r ./project/* user@server:/var/www/timee/
```

### 步骤3: 部署应用
```bash
# 在服务器上
cd /var/www/timee

# 安装依赖
npm install

# 启动服务 (生产环境)
pm2 start ecosystem.prod.js --env production

# 保存PM2配置
pm2 save
```

### 步骤4: 配置反向代理 (可选)
如果使用Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ 云服务器管理命令

### 查看服务状态
```bash
pm2 status
pm2 monit
```

### 查看日志
```bash
pm2 logs timee-proxy
pm2 logs timee-proxy --lines 100
```

### 重启服务
```bash
pm2 restart timee-proxy
pm2 reload timee-proxy  # 零停机重启
```

### 停止服务
```bash
pm2 stop timee-proxy
pm2 delete timee-proxy  # 完全删除
```

### 更新代码
```bash
# 更新代码后
git pull origin main
npm install
pm2 reload timee-proxy
```

## 🔒 安全考虑

### 1. 防火墙设置
```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 2. 非root用户运行
```bash
# 创建专用用户
sudo adduser timee-app
sudo usermod -aG sudo timee-app

# 切换到该用户运行应用
su - timee-app
```

### 3. 环境变量管理
创建 `.env` 文件:
```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=your-database-url
```

## 💾 备份和恢复

### 备份PM2配置
```bash
pm2 save
# 配置保存在 ~/.pm2/dump.pm2
```

### 恢复PM2配置
```bash
pm2 resurrect
```

## 📊 监控和日志

### 设置日志轮转
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 监控设置
```bash
# 安装监控模块
pm2 install pm2-server-monit
```

## ⚠️ 注意事项

1. **端口冲突**: 确保云服务器上8080端口未被占用
2. **内存限制**: 根据服务器配置调整 `max_memory_restart`
3. **域名配置**: 如果使用域名，需要配置DNS解析
4. **SSL证书**: 生产环境建议配置HTTPS

## 🆘 故障排除

### 服务无法启动
```bash
# 检查端口占用
sudo netstat -tlnp | grep :8080

# 检查PM2日志
pm2 logs timee-proxy --err

# 检查系统资源
free -h
df -h
```

### 服务意外停止
```bash
# 查看PM2进程
pm2 list

# 重启服务
pm2 restart timee-proxy

# 查看错误日志
pm2 logs timee-proxy --err --lines 50
``` 