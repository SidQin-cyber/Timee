import React from 'react'

export const ChangelogPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          更新日志
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Timee 的版本更新记录
        </p>
      </div>

      <div className="space-y-8">
        <div className="border-l-4 border-indigo-500 pl-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">v1.0.0</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">2024-06-14</span>
          </div>
          <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li>• 🎉 首次发布</li>
            <li>• ✨ 支持创建时间协调约定</li>
            <li>• 📱 响应式设计，支持移动端</li>
            <li>• 🌙 深色模式支持</li>
            <li>• 🔗 分享链接功能</li>
          </ul>
        </div>

        <div className="border-l-4 border-gray-300 pl-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">v0.9.0</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">2024-06-10</span>
          </div>
          <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li>• 🧪 Beta 测试版本</li>
            <li>• 🎨 UI/UX 优化</li>
            <li>• 🐛 修复已知问题</li>
          </ul>
        </div>

        <div className="border-l-4 border-gray-300 pl-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">v0.8.0</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">2024-06-05</span>
          </div>
          <ul className="mt-2 space-y-1 text-gray-600 dark:text-gray-300">
            <li>• 🚀 Alpha 测试版本</li>
            <li>• 📋 基础功能实现</li>
            <li>• 🔧 项目架构搭建</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 