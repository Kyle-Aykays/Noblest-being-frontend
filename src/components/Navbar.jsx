import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "../assets/css/toggle.css";
import NB from '../assets/logo/NB.png';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-gray-100 font-sans w-full m-0">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div>
              <Link to="/" className="flex items-center">
      
               
                <span className="ml-2 text-xl font-semibold text-gray-800 h-9">
                  <img src={NB} alt="" className="logo"/>
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex sm:items-center space-x-4 custom-gap">
              <Link
                to="/home"
                className="text-gray-800 text-sm font-semibold hover:text-purple-600"
              >
                Home
              </Link>
              <Link
                to="/stats"
                className="text-gray-800 text-sm font-semibold hover:text-purple-600"
              >
                Stats
              </Link>
              <Link
                to="/profile"
                className="block text-gray-800 text-sm font-semibold py-2 hover:text-purple-600"
              >
                Profile
              </Link>
              <Link
                to="/login"
                className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-purple-600 hover:border-purple-600 "
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-gray-800 text-sm font-semibold border px-4 py-2 rounded-lg hover:text-purple-600 hover:border-purple-600 "
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Icon */}
            <div className="sm:hidden">
              <button onClick={toggleMobileMenu}>
                <FontAwesomeIcon icon={faBars} className="text-purple-600" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden mt-2">
              <Link
                to="/home"
                className="block text-gray-800 text-sm font-semibold py-2 hover:text-purple-600"
              >
                Home
              </Link>
              <Link
                to="/stats"
                className="block text-gray-800 text-sm font-semibold py-2 hover:text-purple-600"
              >
                Stats
              </Link>
              <Link
                to="/profile"
                className="block text-gray-800 text-sm font-semibold py-2 hover:text-purple-600"
              >
                Profile
              </Link>
              <Link
                to="/login"
                className="block text-gray-800 text-sm font-semibold py-2 hover:text-purple-600"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block text-gray-800 text-sm font-semibold py-2 border-t mt-2 hover:text-purple-600"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
