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
  LaunchingScreen,
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
  // 1. Secret / Internal Testing Storefront Routes mounted at /prelaunch
  {
    path: '/prelaunch',
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

  // 2. Secret / Internal Testing Admin Routes mounted at /prelaunch/admin
  {
    path: '/prelaunch/admin',
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
        element: <Navigate to="/prelaunch/admin/dashboard" replace />,
      },
    ],
  },
  {
    path: '/prelaunch/admin/auth',
    element: (
      <AdminAuthProvider>
        <AdminAuthPage />
      </AdminAuthProvider>
    ),
  },
  {
    path: '/prelaunch/admin/login',
    element: <Navigate to="/prelaunch/admin/auth" replace />,
  },

  // 3. Public Pre-Launch Gateway: Render Launching Screen at /
  {
    path: '/',
    element: <LaunchingScreen />,
  },

  // 4. Any other non-prelaunch route renders the Launching Screen so outsiders cannot visit storefront/admin
  {
    path: '*',
    element: <LaunchingScreen />,
  },
];

export const router = createBrowserRouter(routes);

export default router;
