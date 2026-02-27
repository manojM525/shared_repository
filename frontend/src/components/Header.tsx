import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo2.png';

interface AuthContextType {
  user: { [key: string]: any } | null;
  isAuthenticated: boolean;
  logout: () => void;
}

interface CartContextType {
  totalItems: number;
}

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { user, isAuthenticated, logout } = useAuth() as AuthContextType;
  const { totalItems } = useCart() as CartContextType;
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-logo {
            animation: fadeIn 0.5s ease-out;
          }
          .mobile-menu {
            transition: all 0.3s ease-in-out;
            transform-origin: top;
          }
          .mobile-menu-closed {
            transform: scaleY(0);
            opacity: 0;
            height: 0;
          }
          .mobile-menu-open {
            transform: scaleY(1);
            opacity: 1;
            height: auto;
          }
        `}
      </style>
      <header className="bg-[#FFFFFF] shadow-md sticky top-0 z-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo and Name */}
            <Link to="/" className="flex items-center space-x-2 group animate-logo">
              <img
                src={logo}
                alt="The Micro Green Guy Logo"
                className="h-14 w-20 transition-transform duration-300 transform group-hover:scale-105"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150x40?text=Logo')}
              />
              <div>
                <span className="text-lg sm:text-2xl font-bold text-gray-900">the microgreen guy</span>
                {/* <span className="text-lg sm:text-2xl font-bold text-[#FFCA28] ml-1">guy</span> */}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link
                to="/"
                className="text-gray-800 hover:text-[#FFCA28] transition-colors duration-200 font-medium text-sm lg:text-base   rounded"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-800 hover:text-[#FFCA28] transition-colors duration-200 font-medium text-sm lg:text-base  rounded"
              >
                Products
              </Link>
              <Link
                to="/blogs"
                className="text-gray-800 hover:text-[#FFCA28] transition-colors duration-200 font-medium text-sm lg:text-base  rounded"
              >
                Blogs
              </Link>
              <Link
                to="/recipe"
                className="text-gray-800 hover:text-[#FFCA28] transition-colors duration-200 font-medium text-sm lg:text-base  rounded"
              >
                Recipe
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/orders"
                    className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 flex items-center space-x-1 text-sm lg:text-base  rounded"
                  >
                    <User className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    to="/cart"
                    className="relative text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 rounded"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#2E7D32] text-[#FFFFFF] text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                  <button
  onClick={() => {
    const confirmed = confirm("Are you sure you want to logout?");
    if (confirmed) {
      handleLogout();
    }
  }}
  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base font-medium touch-manipulation"
  aria-label="Logout"
>
  <LogOut size={16} className="inline mr-2" />
  Logout
</button>

                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 font-medium text-sm lg:text-base  rounded"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-[#2E7D32] text-[#FFFFFF] px-4 py-2 rounded-lg hover:bg-[#FFCA28] hover:text-[#2E7D32] transition-transform duration-200 transform hover:scale-105 font-medium text-sm lg:text-base "
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 rounded-md text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className={`md:hidden py-4 border-t border-gray-200 mobile-menu ${isMenuOpen ? 'mobile-menu-open' : 'mobile-menu-closed'}`}>
              <nav className="flex flex-col space-y-4 px-4">
                <Link
                  to="/"
                  className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 font-medium text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 font-medium text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  to="/blogs"
                  className="text-gray-800 hover:text-[#FFCA28] transition-colors duration-200 font-medium text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blogs
                </Link>
                <Link
                  to="/recipe"
                  className="text-gray-800 hover:text-[#FFCA28] transition-colors duration-200 font-medium text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Recipe
                </Link>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/orders"
                      className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 font-medium text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <Link
                      to="/cart"
                      className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 font-medium flex items-center space-x-2 text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Cart ({totalItems})</span>
                    </Link>
                    <button
  onClick={() => {
    const confirmed = confirm("Are you sure you want to logout?");
    if (confirmed) {
      handleLogout();
    }
  }}
  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm sm:text-base font-medium touch-manipulation"
  aria-label="Logout"
>
  <LogOut size={16} className="inline mr-2" />
  Logout
</button>

                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 font-medium text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-gray-800 hover:text-[#FFCA28] transition-transform duration-200 transform hover:scale-105 font-medium text-base focus:ring-2 focus:ring-[#FFCA28] focus:ring-opacity-50 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;