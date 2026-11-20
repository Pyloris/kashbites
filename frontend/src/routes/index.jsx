import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { HomePage } from '../pages/HomePage.jsx';
import { ProductDetailPage } from '../components/product/ProductDetailPage.jsx';
import { UserProfilePage } from '../pages/UserProfilePage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'product/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'profile',
        element: <UserProfilePage />,
      },
      {
        path: 'catalog',
        element: <HomePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '*',
        element: null,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);

export default router;
