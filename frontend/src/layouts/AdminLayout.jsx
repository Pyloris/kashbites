import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AdminPanelPage } from '../pages/AdminPanelPage.jsx';

export const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanelPage
        onBackToStorefront={() => {
          navigate('/');
        }}
      />
      <Outlet />
    </div>
  );
};
