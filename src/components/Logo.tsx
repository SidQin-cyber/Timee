import React from 'react'

// 直接导入logo文件
import logoUrl from '../assets/logo.svg?url'

interface LogoProps {
  className?: string
  style?: React.CSSProperties
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "h-10 w-auto",
  style
}) => {
  const [logoError, setLogoError] = React.useState(false)

  if (logoUrl && !logoError) {
    // 显示自定义logo
    return (
      <img 
        src={logoUrl} 
        alt="Timee Logo" 
        className={`object-contain ${className}`}
        style={style}
        onError={() => setLogoError(true)}
      />
    )
  } else {
    // 显示默认logo（当前的方块设计）
    return (
      <div className={`bg-indigo-600 rounded-md flex items-center justify-center ${className}`} style={style}>
        <div className="w-3 h-3 bg-white rounded-sm"></div>
      </div>
    )
  }
} 