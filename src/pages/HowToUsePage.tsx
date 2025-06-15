import React from 'react'

export const HowToUsePage: React.FC = () => {
  return (
    <div className="h-full bg-gray-50/30 flex flex-col relative">
      {/* 背景涂层 - 与sidebar颜色一致 */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#f8fafc' }} />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* 主标题区域 */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-light text-gray-900 mb-6 tracking-tight leading-tight">
            如何使用 Timee
          </h1>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            三步走，搞定时间协调。
          </p>
        </div>

        {/* 功能介绍区域 */}
        <div className="space-y-24">
          {/* 第一步：创建时间计划 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">1</span>
                </div>
                <h3 className="text-2xl font-light text-gray-900">创建时间计划</h3>
              </div>
              <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                <p>选择活动日期，设定时间范围。只需点击几下，活动就准备好了。</p>
                <p>支持多日期选择和自定义时间段，完全适应您的团队节奏。</p>
              </div>
            </div>
            <div className="relative">
              <div className="p-8">
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 rounded ${
                        [8, 9].includes(i) 
                          ? 'bg-emerald-200' 
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 第二步：邀请成员参与 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">2</span>
                </div>
                <h3 className="text-2xl font-light text-gray-900">邀请成员参与</h3>
              </div>
              <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                <p>复制链接或分享T-Code，团队成员即可加入。链接一发，大家就能选时间。</p>
                <p>每个人标记自己的可用时间，系统自动汇总所有响应。</p>
              </div>
            </div>
            <div className="lg:order-1 relative">
              <div className="p-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full flex-1"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 第三步：实时查看热力图 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">3</span>
                </div>
                <h3 className="text-2xl font-light text-gray-900">实时查看热力图</h3>
              </div>
              <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                <p>热力图实时显示团队可用性，颜色越深代表越多人可参与。</p>
                <p>一目了然找到最佳时间段，让决策变得简单直观。</p>
              </div>
            </div>
            <div className="relative">
              <div className="p-8">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg ${
                        [3, 4].includes(i)
                          ? 'bg-blue-200'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部总结 */}
        <div className="text-center mt-24 pt-16 border-t border-gray-200/50">
          <h3 className="text-2xl font-light text-gray-900 mb-4">
            开始使用 Timee
          </h3>
          <p className="text-gray-500 font-light max-w-xl mx-auto leading-relaxed mb-8">
            无需注册，无需下载。打开浏览器，即刻开启协作。
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200 group"
          >
            立即体验 Timee
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
} 