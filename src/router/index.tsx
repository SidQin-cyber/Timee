import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { EventPage } from '@/pages/EventPage'
import { HowToUsePage } from '@/pages/HowToUsePage'
import { WishlistPage } from '@/pages/WishlistPage'
import { ChangelogPage } from '@/pages/ChangelogPage'
import { FeedbackPage } from '@/pages/FeedbackPage'
import { JoinByCodePage } from '@/pages/JoinByCodePage'
import { JoinByLinkPage } from '@/pages/JoinByLinkPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'event/:eventId',
        element: <EventPage />
      },
      {
        path: 'how-to-use',
        element: <HowToUsePage />
      },
      {
        path: 'wishlist',
        element: <WishlistPage />
      },
      {
        path: 'changelog',
        element: <ChangelogPage />
      },
      {
        path: 'feedback',
        element: <FeedbackPage />
      },
      {
        path: 'join-by-code',
        element: <JoinByCodePage />
      },
      {
        path: 'join-by-link',
        element: <JoinByLinkPage />
      }
    ]
  }
]) 