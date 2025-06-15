# Assets 文件夹

## Logo 设置说明

### 如何添加自定义 Logo

1. **准备 Logo 文件**
   - 支持格式：PNG、SVG、JPG、JPEG
   - 建议尺寸：24x24px 或更大（会自动缩放）
   - PNG格式建议使用透明背景
   - SVG格式确保代码干净，没有多余的元素

2. **上传 Logo**
   - 将你的 logo 文件重命名为以下之一：
     - `logo.png` （推荐，支持透明背景）
     - `logo.svg` （矢量格式，无损缩放）
     - `logo.jpg` 或 `logo.jpeg`
   - 将文件放在这个 `src/assets/` 文件夹中

3. **自动生效**
   - 保存文件后，应用会自动检测并使用新的 logo
   - 如果检测不到自定义 logo，会自动回退到默认的方块设计

### 文件结构
```
src/assets/
├── README.md (本文件)
└── logo.png/svg/jpg/jpeg (你的自定义 logo - 需要你上传)
```

### 支持的文件格式优先级
系统会按以下顺序查找logo文件：
1. `logo.png` （最优先）
2. `logo.svg`
3. `logo.jpg`
4. `logo.jpeg`

### 注意事项
- 文件名必须是 `logo` + 对应扩展名
- PNG格式推荐使用透明背景，视觉效果更好
- Logo 会在侧边栏和导航栏中显示
- 支持响应式设计，在不同设备上自动调整大小

### 故障排除
如果 logo 没有显示：
1. 检查文件名是否正确（如 `logo.png`）
2. 检查文件是否在正确的路径 `src/assets/`
3. 检查图片文件是否有效
4. 刷新浏览器页面 