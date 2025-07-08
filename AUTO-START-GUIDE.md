# Timee 自动启动配置指南

## 问题描述

DevBox 重启或重新发布后，Timee 应用服务不会自动启动，导致：
- 公共地址显示 "Pending" 状态
- 出现 "upstream connect error" 错误
- 需要手动重启服务才能恢复正常

## 解决方案

我们实现了**多重自动启动机制**，确保 DevBox 重启后服务自动恢复：

### 🔧 已配置的自动启动机制

1. **`.bashrc` 集成** - 用户登录时自动启动
2. **系统包装脚本** - 系统级别的启动支持
3. **Systemd 用户服务** - 服务级别的自动管理
4. **后台监控程序** - 持续健康检查和自动恢复
5. **初始化脚本** - 多点触发启动
6. **容器入口点** - 容器启动时自动运行

### 📋 关键文件说明

- `startup-on-boot.sh` - 主启动脚本
- `configure-autostart.sh` - 自动启动配置脚本
- `background-monitor.sh` - 后台监控程序
- `test-autostart.sh` - 自动启动测试脚本
- `entrypoint.sh` - 容器入口点（已增强）

## 🚀 使用方法

### 初次配置（已完成）

```bash
# 配置自动启动（只需运行一次）
./configure-autostart.sh
```

### 测试自动启动

```bash
# 测试自动启动配置
./test-autostart.sh
```

### 手动启动服务

```bash
# 快速启动
./quick-start.sh

# 带监控的启动
./auto-start.sh

# DevBox 重启后的启动
./startup-on-boot.sh
```

### 停止服务

```bash
# 停止所有服务
./stop-production.sh
```

### 检查状态

```bash
# 检查服务状态
./status.sh

# 检查健康状态
./check-health.sh
```

## 🔄 自动启动工作流程

### DevBox 重启后的启动序列

1. **容器启动** → `entrypoint.sh` 自动运行
2. **用户登录** → `.bashrc` 触发启动检查
3. **系统服务** → Systemd 尝试启动服务
4. **后台监控** → 每5分钟检查并自动恢复
5. **健康检查** → 持续监控服务状态

### 启动优先级

```
entrypoint.sh (容器级别)
    ↓
startup-on-boot.sh (主启动脚本)
    ↓
quick-start.sh (快速启动)
    ↓
auto-start.sh (监控启动，备用)
```

## 📊 监控和日志

### 查看启动日志

```bash
# 启动日志
tail -f logs/boot-startup.log

# 后台监控日志
tail -f logs/monitor.log

# 测试日志
tail -f logs/autostart-test.log

# 系统日志
tail -f logs/startup.log
```

### 实时状态监控

```bash
# 显示详细状态
./status.sh

# 持续监控
watch -n 10 './status.sh'
```

## 🧪 测试验证

### 完整测试流程

```bash
# 1. 运行自动启动测试
./test-autostart.sh

# 2. 模拟 DevBox 重启
./stop-production.sh
sleep 30
./startup-on-boot.sh

# 3. 验证服务状态
./check-health.sh
./status.sh
```

### 测试结果说明

- ✅ **所有测试通过** - 自动启动配置正常
- ⚠️ **部分警告** - 某些机制可能不可用但不影响核心功能
- ❌ **测试失败** - 需要重新配置或检查问题

## 🔧 故障排除

### 常见问题

1. **服务启动失败**
   ```bash
   # 检查依赖
   npm install --legacy-peer-deps
   
   # 重新生成 Prisma 客户端
   cd timee-api && npx prisma generate
   ```

2. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep -E ':(3000|5173|8080)'
   
   # 停止冲突进程
   ./stop-production.sh
   ```

3. **权限问题**
   ```bash
   # 修复脚本权限
   chmod +x *.sh
   ```

4. **后台监控未运行**
   ```bash
   # 重新启动后台监控
   ./configure-autostart.sh
   ```

### 重新配置

如果自动启动不工作，可以重新配置：

```bash
# 重新配置自动启动
./configure-autostart.sh

# 测试配置
./test-autostart.sh
```

## 📱 外部访问

### 应用 URL

- **主应用**: https://wmxkwzbmhflj.sealoshzh.site
- **API 健康检查**: https://wmxkwzbmhflj.sealoshzh.site/api/health
- **API 状态**: https://wmxkwzbmhflj.sealoshzh.site/api/status

### 本地访问

- **代理服务**: http://localhost:8080
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000/api

## 🎯 关键优势

1. **多重保障** - 6种不同的自动启动机制
2. **自动恢复** - 服务崩溃后自动重启
3. **健康监控** - 持续检查服务状态
4. **快速启动** - 30-60秒内完成服务启动
5. **日志记录** - 完整的启动和运行日志
6. **易于维护** - 简单的命令行工具

## 📝 维护建议

1. **定期检查** - 每周运行一次 `./test-autostart.sh`
2. **日志清理** - 定期清理 `logs/` 目录中的旧日志
3. **更新依赖** - 保持 Node.js 和依赖包更新
4. **备份配置** - 定期备份自动启动配置

## 🚨 紧急恢复

如果所有自动启动机制都失效：

```bash
# 1. 手动启动
./quick-start.sh

# 2. 重新配置自动启动
./configure-autostart.sh

# 3. 测试配置
./test-autostart.sh

# 4. 检查服务状态
./status.sh
```

---

**配置完成后，您的 Timee 应用将在 DevBox 重启后自动启动，无需手动干预！** 