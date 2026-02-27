
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa'; // Import WhatsApp icon

const WhatsApp: React.FC = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/+917569507659', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col ">
      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* WhatsApp Icon */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 bg-[#2E7D32] text-[#FFFFFF] p-4 rounded-full shadow-lg hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-all duration-200 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 z-50"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        <FaWhatsapp className="h-6 w-6" />
      </button>
    </div>
  );
};

export default WhatsApp;
