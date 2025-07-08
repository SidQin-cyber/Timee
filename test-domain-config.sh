#!/bin/bash

echo "🔍 检查域名配置状态..."
echo "================================"

# 检查 DNS 解析
echo "1. 检查 DNS 解析:"
echo "   timee.group -> $(dig +short timee.group)"
echo "   www.timee.group -> $(dig +short www.timee.group)"
echo ""

# 检查域名是否可达
echo "2. 检查域名访问:"
echo "   测试 http://timee.group"
curl -s -I http://timee.group | head -1 || echo "   ❌ 无法访问"
echo ""
echo "   测试 https://timee.group"
curl -s -I https://timee.group | head -1 || echo "   ❌ 无法访问"
echo ""

# 检查 SSL 证书状态
echo "3. 检查 SSL 证书:"
echo "   timee.group SSL 状态:"
openssl s_client -connect timee.group:443 -servername timee.group </dev/null 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null || echo "   ❌ SSL 证书未配置"
echo ""

# 检查当前工作的域名
echo "4. 当前工作的域名:"
echo "   https://wmxkwzbmhflj.sealoshzh.site/"
curl -s -I https://wmxkwzbmhflj.sealoshzh.site/ | head -1

echo ""
echo "✅ 配置完成后，timee.group 应该重定向到你的应用" 