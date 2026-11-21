import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminPage } from '../pages/admin/admin-page.jsx';

export const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPage
        onBackToStorefront={() => {
          navigate('/');
        }}
      />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
