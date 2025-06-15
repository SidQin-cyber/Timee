import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  QuestionMarkCircleIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/20/solid'
import { SidebarLayout } from '@/components/sidebar-layout'
import { 
  Sidebar, 
  SidebarBody, 
  SidebarFooter, 
  SidebarItem, 
  SidebarLabel, 
  SidebarSection,
  SidebarSpacer
} from '@/components/sidebar'
import { Logo } from '@/components/Logo'
import { Divider } from '@/components/divider'

// 搜索图标组件 - T-Code加入
const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
  </svg>
)

// 主页图标组件
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
    <path fillRule="evenodd" d="M7.628 1.349a.75.75 0 0 1 .744 0l1.247.712a.75.75 0 1 1-.744 1.303L8 2.864l-.875.5a.75.75 0 0 1-.744-1.303l1.247-.712ZM4.65 3.914a.75.75 0 0 1-.279 1.023L4.262 5l.11.063a.75.75 0 0 1-.744 1.302l-.13-.073A.75.75 0 0 1 2 6.25V5a.75.75 0 0 1 .378-.651l1.25-.714a.75.75 0 0 1 1.023.279Zm6.698 0a.75.75 0 0 1 1.023-.28l1.25.715A.75.75 0 0 1 14 5v1.25a.75.75 0 0 1-1.499.042l-.129.073a.75.75 0 0 1-.744-1.302l.11-.063-.11-.063a.75.75 0 0 1-.28-1.023ZM6.102 6.915a.75.75 0 0 1 1.023-.279l.875.5.875-.5a.75.75 0 0 1 .744 1.303l-.869.496v.815a.75.75 0 0 1-1.5 0v-.815l-.869-.496a.75.75 0 0 1-.28-1.024ZM2.75 9a.75.75 0 0 1 .75.75v.815l.872.498a.75.75 0 0 1-.744 1.303l-1.25-.715A.75.75 0 0 1 2 11V9.75A.75.75 0 0 1 2.75 9Zm10.5 0a.75.75 0 0 1 .75.75V11a.75.75 0 0 1-.378.651l-1.25.715a.75.75 0 0 1-.744-1.303l.872-.498V9.75a.75.75 0 0 1 .75-.75Zm-4.501 3.708.126-.072a.75.75 0 0 1 .744 1.303l-1.247.712a.75.75 0 0 1-.744 0L6.38 13.94a.75.75 0 0 1 .744-1.303l.126.072a.75.75 0 0 1 1.498 0Z" clipRule="evenodd" />
  </svg>
)

// 搜索图标组件 - 链接加入
const ChainLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
    <path fillRule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clipRule="evenodd" />
  </svg>
)

// 社交媒体图标组件
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const XiaohongshuIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169-.234-.44-.234-.61 0l-1.518 2.1a.78.78 0 01-.61.293h-2.83c-.169 0-.338-.117-.338-.293V8.453c0-.176.169-.293.338-.293h2.83c.27 0 .441-.059.61-.293l1.518-2.1c.169-.234.441-.234.61 0 .169.234.169.41 0 .644l-1.518 2.1c-.169.234-.169.41 0 .644l1.518 2.1c.169.234.169.41 0 .644zm-11.136 0c-.169-.234-.441-.234-.61 0l-1.518 2.1c-.169.234-.169.41 0 .644l1.518 2.1c.169.234.169.41 0 .644-.169.234-.441.234-.61 0l-1.518-2.1a.78.78 0 010-.644l1.518-2.1c.169-.234.169-.41 0-.644l-1.518-2.1c-.169-.234-.169-.41 0-.644.169-.234.441-.234.61 0l1.518 2.1c.169.234.441.234.61 0l1.518-2.1c.169-.234.441-.234.61 0 .169.234.169.41 0 .644l-1.518 2.1c-.169.234-.169.41 0 .644l1.518 2.1c.169.234.169.41 0 .644-.169.234-.441.234-.61 0l-1.518-2.1a.78.78 0 00-.61-.293.78.78 0 00-.61.293l-1.518 2.1z"/>
  </svg>
)

const DouyinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)






const mainNavigation = [
  { name: '回到主页', href: '/', icon: HomeIcon },
]

const joinNavigation = [
  { name: '通过T-Code进入', href: '/join-by-code', icon: TicketIcon },
  { name: '通过链接加入', href: '/join-by-link', icon: ChainLinkIcon },
]

const helpNavigation = [
  { name: '如何使用', href: '/how-to-use', icon: QuestionMarkCircleIcon },
  { name: '功能许愿池', href: '/wishlist', icon: QuestionMarkCircleIcon },
  { name: 'Donate', href: '/donate', icon: ExclamationTriangleIcon },
  { name: '反馈与建议', href: '/feedback', icon: ExclamationTriangleIcon },
]

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: GitHubIcon },
  { name: 'X', href: 'https://x.com', icon: XIcon },
  { name: '小红书', href: 'https://xiaohongshu.com', icon: XiaohongshuIcon },
  { name: '抖音', href: 'https://douyin.com', icon: DouyinIcon },
]

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const navbar = (
    <button 
      onClick={() => navigate('/')}
      aria-label="Home"
      className="hover:scale-105 transition-all duration-200 w-full h-full flex items-start justify-start"
    >
      <Logo className="h-40 w-auto max-w-full -ml-[19px]" style={{ marginTop: '-54.5px' }} />
    </button>
  )

  const sidebar = (
    <Sidebar className="bg-slate-50 dark:bg-zinc-900" style={{ backgroundColor: '#f8fafc' }}>
      <div className="flex flex-col p-4">
        <button 
          onClick={() => navigate('/')}
          aria-label="Home"
          className="hover:scale-105 transition-all duration-200 w-full flex items-start justify-start"
        >
          <Logo className="h-40 w-auto max-w-full -ml-[19px]" style={{ marginTop: '-54.5px' }} />
        </button>
      </div>
      
      <SidebarBody>
        {/* 添加顶部间距，将选项向下移动 */}
        <div className="pt-8"></div>
        
        {/* 所有导航选项放在同一个 Section 中，确保间距完全相等 */}
        <SidebarSection className="gap-4">
          {/* 主导航 - 回到主页 */}
          {mainNavigation.map((item) => {
            const isCurrentPage = location.pathname === item.href
            return (
              <SidebarItem
                key={item.name}
                href={item.href}
                current={isCurrentPage}
                className={`-ml-2 ${isCurrentPage ? 'opacity-50 cursor-default' : ''}`}
              >
                <div className="flex items-center gap-3 w-full">
                  <item.icon />
                  <SidebarLabel>{item.name}</SidebarLabel>
                </div>
              </SidebarItem>
            )
          })}
          
          {/* 加入房间导航 */}
          {joinNavigation.map((item) => (
            <SidebarItem
              key={item.name}
              href={item.href}
              current={location.pathname === item.href}
              className="-ml-2" // 向左移动8px
            >
              <div className="flex items-center gap-3 w-full">
                <item.icon />
                <SidebarLabel>{item.name}</SidebarLabel>
              </div>
            </SidebarItem>
          ))}
        </SidebarSection>
        
        <SidebarSpacer />
      </SidebarBody>

      <SidebarFooter className="border-t-transparent">
        <div className="mb-6">
          <Divider soft />
        </div>
        {/* 帮助链接 - 纯文字极简设计 */}
        <div className="space-y-3">
          {helpNavigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="block text-sm text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors duration-200 font-light"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* 社交媒体链接 - 带图标 */}
        <div className="flex items-center space-x-4 mt-6 pt-4">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors duration-200"
              title={social.name}
            >
              <social.icon />
            </a>
          ))}
        </div>
      </SidebarFooter>
    </Sidebar>
  )

  return (
    <SidebarLayout navbar={navbar} sidebar={sidebar}>
      <Outlet />
    </SidebarLayout>
  )
} 