#!/bin/bash

# 🚀 上传 Timee 项目到 GitHub 的脚本

echo "📤 准备上传 Timee 项目到 GitHub..."

# 检查是否已经是 git 仓库
if [ ! -d ".git" ]; then
    echo "🔧 初始化 Git 仓库..."
    cd ..
    git init
    git add .
    git commit -m "Initial commit: Timee project with Sealos deployment"
else
    echo "✅ 已经是 Git 仓库"
fi

echo ""
echo "📝 接下来请按照以下步骤操作："
echo ""
echo "1. 在 GitHub 上创建一个新仓库："
echo "   - 打开 https://github.com/new"
echo "   - 仓库名称建议：timee-project"
echo "   - 设置为 Public（公开）"
echo "   - 不要勾选 'Initialize this repository with a README'"
echo "   - 点击 'Create repository'"
echo ""
echo "2. 复制 GitHub 给你的仓库地址（类似：https://github.com/你的用户名/timee-project.git）"
echo ""
echo "3. 回到这里，运行以下命令："
echo "   git remote add origin https://github.com/你的用户名/timee-project.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. 上传完成后，你的仓库地址就是：https://github.com/你的用户名/timee-project"
echo ""
echo "📋 然后你就可以在 Sealos 应用商店中使用这个地址部署了！" 