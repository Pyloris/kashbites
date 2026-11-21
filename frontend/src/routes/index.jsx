import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import {
  HomePage,
  CatalogPage,
  ProductDetailPage,
  UserProfilePage,
  UserSettingsPage,
  AboutPage,
  ContactPage,
  PrivacyPolicyPage,
  TermsPage,
  NotFoundPage,
} from '../pages/index.js';
import {
  AdminAuthPage,
  AdminDashboardPage,
  AdminInventoryPage,
  AdminCategoriesPage,
  AdminCouponsPage,
  AdminOrdersPage,
  AdminUsersPage,
  AdminWebhooksPage,
  AdminAuthProvider,
} from '../pages/admin/index.js';

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
        path: 'catalog',
        element: <CatalogPage />,
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
        path: 'settings',
        element: <UserSettingsPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicyPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPolicyPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'terms-of-service',
        element: <TermsPage />,
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
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'inventory',
        element: <AdminInventoryPage />,
      },
      {
        path: 'products',
        element: <AdminInventoryPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'coupons',
        element: <AdminCouponsPage />,
      },
      {
        path: 'offers',
        element: <AdminCouponsPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'customers',
        element: <AdminUsersPage />,
      },
      {
        path: 'webhooks',
        element: <AdminWebhooksPage />,
      },
      {
        path: '*',
        element: <Navigate to="/admin/dashboard" replace />,
      },
    ],
  },
  {
    path: '/admin/auth',
    element: (
      <AdminAuthProvider>
        <AdminAuthPage />
      </AdminAuthProvider>
    ),
  },
  {
    path: '/admin/login',
    element: <Navigate to="/admin/auth" replace />,
  },
];

export const router = createBrowserRouter(routes);

export default router;
