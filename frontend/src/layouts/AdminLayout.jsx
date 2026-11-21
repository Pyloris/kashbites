import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminAuthProvider } from '../pages/admin/context/AdminAuthContext.jsx';
import { AdminProtectedRoute } from '../pages/admin/components/AdminProtectedRoute.jsx';
import { AdminSidebar } from '../pages/admin/components/AdminSidebar.jsx';

export const AdminLayout = () => {
  return (
    <AdminAuthProvider>
      <AdminProtectedRoute>
        <div className="min-h-screen bg-brand-canvas flex">
          <AdminSidebar />
          <main className="flex-1 min-w-0 flex flex-col bg-brand-canvas overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </AdminProtectedRoute>
    </AdminAuthProvider>
  );
};

export default AdminLayout;
