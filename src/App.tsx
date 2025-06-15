import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/hooks/useTheme'
import { router } from '@/router'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
