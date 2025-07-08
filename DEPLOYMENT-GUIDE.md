# Timee 应用部署指南

## 🚀 问题解决方案

### 问题描述
每次发布或重启后出现 "upstream connect error or disconnect/reset before headers" 错误。

### 根本原因
1. **API URL 硬编码问题**: 前端直接连接 `localhost:3000` 而不是通过代理
2. **服务启动竞态条件**: 代理服务器在后端/前端准备好之前启动
3. **Prisma 客户端配置问题**: 版本不兼容导致后端崩溃
4. **缺少自动恢复机制**: 服务崩溃后无法自动重启

### 解决方案
✅ 修复了 API URL 硬编码（使用相对路径 `/api`）  
✅ 实现了健康检查和服务就绪验证  
✅ 升级了 Prisma 到兼容版本  
✅ 添加了自动启动和监控机制  

## 📋 可用脚本

### 1. 快速启动 (推荐)
```bash
./quick-start.sh
```
- 立即启动所有服务
- 包含健康检查和错误处理
- 适用于手动重启

### 2. 自动启动 (带监控)
```bash
./auto-start.sh
```
- 启动服务并持续监控
- 自动重启崩溃的服务
- 适用于长期运行

### 3. 健康检查
```bash
./check-health.sh
```
- 检查应用健康状态
- 如果不健康会自动重启
- 适用于定期检查

### 4. 状态查看
```bash
./status.sh
```
- 显示详细的服务状态
- 包含进程、端口、日志信息
- 适用于故障排查

### 5. 停止服务
```bash
./stop-production.sh
```
- 停止所有服务
- 清理进程和PID文件

### 6. 设置自动启动
```bash
./setup-autostart.sh
```
- 配置容器重启后自动启动
- 设置 cron 任务和 systemd 服务
- 只需运行一次

## 🔧 自动启动配置

### 已配置的自动启动机制:
1. **Cron 任务**: 系统重启后自动启动
2. **Systemd 用户服务**: 服务级别的自动重启
3. **容器入口脚本**: Docker 容器启动时自动运行

### 验证自动启动:
```bash
# 检查 cron 任务
crontab -l

# 检查 systemd 服务状态
systemctl --user status timee.service

# 手动启动 systemd 服务
systemctl --user start timee.service
```

## 🩺 故障排查

### 1. 服务无法启动
```bash
# 检查状态
./status.sh

# 查看日志
tail -f logs/api.log
tail -f logs/frontend.log
tail -f logs/proxy.log
```

### 2. 外部 URL 无法访问
```bash
# 检查健康状态
curl -s http://localhost:8080/health

# 检查外部连接
curl -s https://wmxkwzbmhflj.sealoshzh.site/api/health
```

### 3. 服务崩溃
```bash
# 立即重启
./quick-start.sh

# 或启动监控模式
./auto-start.sh
```

## 📊 服务架构

```
External URL (https://wmxkwzbmhflj.sealoshzh.site)
                    ↓
              Proxy Server (Port 8080)
                    ↓
        ┌─────────────────────────────┐
        ↓                             ↓
Backend API (Port 3000)    Frontend (Port 5173)
        ↓                             ↓
   Database (PostgreSQL)          Static Files
```

## 🔄 重启后的自动恢复流程

1. **容器启动** → 运行 `entrypoint.sh`
2. **Cron 任务** → 30秒后运行 `/home/devbox/timee-startup.sh`
3. **健康检查** → 如果服务未运行，启动 `quick-start.sh`
4. **监控模式** → 如果快速启动失败，启动 `auto-start.sh`
5. **持续监控** → 每60秒检查一次健康状态

## 💡 最佳实践

### 发布新版本后:
1. 运行 `./quick-start.sh` 立即启动服务
2. 运行 `./check-health.sh` 验证服务正常
3. 运行 `./status.sh` 查看详细状态

### 定期维护:
1. 检查日志文件大小 (`ls -lh logs/`)
2. 清理旧日志 (`truncate -s 0 logs/*.log`)
3. 验证自动启动配置 (`crontab -l`)

### 紧急情况:
1. 立即重启: `./quick-start.sh`
2. 强制停止: `./stop-production.sh`
3. 查看错误: `./status.sh`

## 🌍 应用访问地址

- **外部访问**: https://wmxkwzbmhflj.sealoshzh.site
- **API 健康检查**: https://wmxkwzbmhflj.sealoshzh.site/api/health
- **点赞功能**: https://wmxkwzbmhflj.sealoshzh.site/api/likes/stats

## 📝 日志文件

- `logs/api.log` - 后端 API 日志
- `logs/frontend.log` - 前端服务日志
- `logs/proxy.log` - 代理服务器日志
- `logs/auto-start.log` - 自动启动日志
- `logs/startup.log` - 系统启动日志
- `logs/systemd.log` - Systemd 服务日志

## 🔒 安全注意事项

1. 所有服务都在用户空间运行（非 root）
2. 数据库连接使用环境变量
3. CORS 配置限制外部访问
4. JWT 密钥通过环境变量配置

---

## 🎯 快速解决方案

**如果应用无法访问，按以下步骤操作：**

1. 运行快速启动:
   ```bash
   ./quick-start.sh
   ```

2. 如果仍然失败，检查状态:
   ```bash
   ./status.sh
   ```

3. 查看详细日志:
   ```bash
   tail -20 logs/api.log
   tail -20 logs/proxy.log
   ```

4. 强制重启所有服务:
   ```bash
   ./stop-production.sh
   sleep 5
   ./quick-start.sh
   ```

**这个解决方案应该能够彻底解决你的 "upstream connect error" 问题！** 🎉 