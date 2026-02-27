import React from 'react';
// import { Sprout, } from 'lucide-react';
import logo from '../assets/footer_logo.jpg';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1B4D1E] text-[#FFFFFF]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              {/* <div className="bg-[#2E7D32] p-2 rounded-lg">
                <Sprout className="h-6 w-6 text-[#FFFFFF]" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-[#FFFFFF]">The Micro Green</span>
                <span className="text-lg sm:text-xl font-bold text-[#FFCA28] ml-1">Guy</span>
              </div> */}
               <img
                src={logo}
                alt="The Micro Green Guy Logo"
                className="h-19 w-20 transition-transform duration-300 transform group-hover:scale-105"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150x40?text=Logo')}
              />
              <div>
                <span className="text-lg sm:text-2xl font-bold text-white-900">the microgreen guy</span>
                {/* <span className="text-lg sm:text-2xl font-bold text-[#FFCA28] ml-1">guy</span> */}
              </div>
            </div>
            <p className="text-gray-300 text-sm sm:text-base max-w-md">
              Fresh, nutritious microgreens and sprouts delivered right to your door. 
              Growing healthy communities one sprout at a time.
            </p>
          </div>

          

          {/* Quick Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-[#FFFFFF]">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="/"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                Home
              </a>
              <a
                href="/about"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                About Us
              </a>
              <a
                href="/contact"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                Contact us
              </a>
              <a
                href="/faq"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                FAQ
              </a>
               <a
                href="/wishlist"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                Wishlist
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-[#FFFFFF]">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="/products"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                Our Products
              </a>
              <a
                href="/terms"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                Terms & Conditions
              </a>
              <a
                href="/privacy"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                Privacy & policy
              </a>
               <a
                href="/shipping"
                className="block text-gray-300 hover:text-[#FFCA28] transition-colors duration-200 text-sm sm:text-base"
              >
                Shipping-and-delivery
              </a> 
            </div>
          </div>
          
        </div>
        

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-sm sm:text-base">
            © 2025 The Micro Green Guy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;