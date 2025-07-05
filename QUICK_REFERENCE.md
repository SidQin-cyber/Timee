# PM2 快速操作指南

## 🚀 本地开发环境

### 启动服务
```bash
./pm2-manager.sh start
# 或者
npm run pm2:start
```

### 查看状态
```bash
./pm2-manager.sh status
# 或者
npm run pm2:status
```

### 查看日志
```bash
./pm2-manager.sh logs
# 或者
npm run pm2:logs
```

### 停止服务
```bash
./pm2-manager.sh stop
# 或者
npm run pm2:stop
```

### 重启服务
```bash
./pm2-manager.sh restart
# 或者
npm run pm2:restart
```

## 🧹 完全清理PM2

### ⚠️ 危险操作 - 会删除所有PM2进程和配置
```bash
./pm2-manager.sh cleanup
# 或者
npm run pm2:cleanup
```

## 🌐 云服务器部署

### 1. 准备部署配置
```bash
./pm2-manager.sh deploy-prep
# 或者
npm run deploy:prep
```

### 2. 在云服务器上启动
```bash
npm run prod:start
```

### 3. 云服务器管理
```bash
npm run prod:stop      # 停止
npm run prod:restart   # 重启
```

## 🔄 迁移场景

### 从本地到云服务器
1. **本地清理** (可选):
   ```bash
   ./pm2-manager.sh cleanup
   ```

2. **上传代码到服务器**:
   ```bash
   scp -r ./* user@server:/path/to/project/
   ```

3. **在服务器上启动**:
   ```bash
   npm install
   npm run prod:start
   ```

### 从云服务器回到本地
1. **停止服务器上的PM2**:
   ```bash
   pm2 kill  # 在服务器上执行
   ```

2. **在本地启动**:
   ```bash
   ./pm2-manager.sh start
   ```

## 📊 监控和调试

### 实时监控
```bash
npm run pm2:monit
```

### 查看详细日志
```bash
pm2 logs timee-proxy --lines 100
```

### 检查进程状态
```bash
pm2 show timee-proxy
```

## 🆘 紧急情况处理

### 完全杀死所有PM2进程
```bash
npm run pm2:kill
# 或者
pm2 kill
```

### 清理僵尸进程
```bash
pkill -f "PM2"
pkill -f "proxy-server.js"
```

### 检查端口占用
```bash
sudo netstat -tlnp | grep :8080
sudo lsof -i :8080
```

## 💡 最佳实践

1. **开发时**：使用 `npm run dev` 进行开发
2. **测试时**：使用 `./pm2-manager.sh start` 测试PM2
3. **部署前**：使用 `./pm2-manager.sh deploy-prep` 准备配置
4. **生产环境**：使用 `npm run prod:start` 启动生产服务
5. **清理时**：使用 `./pm2-manager.sh cleanup` 完全清理 