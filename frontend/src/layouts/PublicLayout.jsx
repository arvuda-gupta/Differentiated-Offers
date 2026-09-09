import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar isPublic={true} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
