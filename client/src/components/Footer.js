import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">VoTIPian</h2>
            <p className="text-gray-300">
              A web-based voting system for Technological Institute of the Philippines.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                
                <Link to="/elections" className="text-gray-300 hover:text-white">
                  Elections
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="text-gray-300 hover:text-white">
                  Candidates
                </Link>
              </li>
              <li>
                <Link to="/discussions" className="text-gray-300 hover:text-white">
                  Discussions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">Technological Institute of the Philippines - Manila</p>
            <p className="text-gray-300">Arlegui, Quiapo, Manila</p>
            <p className="text-gray-300">Philippines</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300">
            &copy; {currentYear} VoTipian. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;