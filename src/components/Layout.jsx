// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top navigation */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-grow bg-gray-100 dark:bg-gray-800">
        <Outlet /> {/* 👈 This is where nested routes render */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
