import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 bg-black overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}


