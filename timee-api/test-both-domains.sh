#!/bin/bash

echo "🔍 测试两个域名的状态"
echo "========================"
echo

# 测试原域名
echo "1️⃣ 测试原域名: wmxkwzbmhlj.sealoshzh.site"
ORIGINAL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://wmxkwzbmhlj.sealoshzh.site/" 2>/dev/null)
echo "   响应码: $ORIGINAL_RESPONSE"

# 测试新域名
echo "2️⃣ 测试新域名: bvbbrbhpozng.sealoshzh.site"
NEW_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://bvbbrbhpozng.sealoshzh.site/" 2>/dev/null)
echo "   响应码: $NEW_RESPONSE"

echo
echo "🎯 建议操作:"
echo "============"

if [ "$ORIGINAL_RESPONSE" = "404" ] && [ "$NEW_RESPONSE" = "404" ]; then
    echo "两个域名都返回404，建议："
    echo "1. 修改现有应用(wmxkwzbmhlj.sealoshzh.site)使用socat"
    echo "2. 镜像: alpine/socat"
    echo "3. 命令: socat TCP-LISTEN:80,fork TCP:devbox-timee.ns-upg0e2qv.svc.cluster.local:8080"
elif [ "$ORIGINAL_RESPONSE" = "404" ]; then
    echo "原域名返回404，新域名状态: $NEW_RESPONSE"
    echo "建议修改原域名对应的应用配置"
elif [ "$NEW_RESPONSE" = "404" ]; then
    echo "新域名返回404，原域名状态: $ORIGINAL_RESPONSE"
    echo "建议使用原域名继续配置"
else
    echo "原域名状态: $ORIGINAL_RESPONSE"
    echo "新域名状态: $NEW_RESPONSE"
fi

echo
echo "🔧 socat配置命令:"
echo "socat TCP-LISTEN:80,fork TCP:devbox-timee.ns-upg0e2qv.svc.cluster.local:8080" 