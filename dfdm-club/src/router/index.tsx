import { createBrowserRouter, Navigate } from 'react-router-dom'
import React, { Suspense } from 'react'
import Layout from '@/components/Layout/Layout'
import Loading from '@/components/common/Loading'

const Home = React.lazy(() => import('@/pages/Home'))
const Activities = React.lazy(() => import('@/pages/Activities'))
const Market = React.lazy(() => import('@/pages/Market'))
const Fanworks = React.lazy(() => import('@/pages/Fanworks'))
const Guestbook = React.lazy(() => import('@/pages/Guestbook'))
const Monthly = React.lazy(() => import('@/pages/Monthly'))
const Members = React.lazy(() => import('@/pages/Members'))
const Profile = React.lazy(() => import('@/pages/Profile'))
const Admin = React.lazy(() => import('@/pages/Admin'))
const SearchResults = React.lazy(() => import('@/pages/Search'))
const Contact = React.lazy(() => import('@/pages/Contact'))
const AdminRoute = React.lazy(() => import('@/pages/Admin/AdminRoute'))

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'activities', element: <LazyPage><Activities /></LazyPage> },
      { path: 'market', element: <LazyPage><Market /></LazyPage> },
      { path: 'fanworks', element: <LazyPage><Fanworks /></LazyPage> },
      { path: 'guestbook', element: <LazyPage><Guestbook /></LazyPage> },
      { path: 'monthly', element: <LazyPage><Monthly /></LazyPage> },
      { path: 'members', element: <LazyPage><Members /></LazyPage> },
      { path: 'profile', element: <LazyPage><Profile /></LazyPage> },
      { path: 'profile/:id', element: <LazyPage><Profile /></LazyPage> },
      { path: 'search', element: <LazyPage><SearchResults /></LazyPage> },
      { path: 'contact', element: <LazyPage><Contact /></LazyPage> },
      {
        path: 'admin',
        element: (
          <LazyPage>
            <AdminRoute>
              <Admin />
            </AdminRoute>
          </LazyPage>
        ),
      },
    ],
  },
])

export default router
