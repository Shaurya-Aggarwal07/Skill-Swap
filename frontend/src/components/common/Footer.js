import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Github, Linkedin, Twitter, Instagram, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white text-lg font-bold mb-4">Skill Swap</h3>
            <p className="text-sm mb-4">
              A platform where people can exchange skills and knowledge through 
              one-on-one sessions, creating a community of continuous learning.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-gray-400 hover:text-white transition-colors">
                  Browse Users
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/swaps" className="text-gray-400 hover:text-white transition-colors">
                  My Swaps
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-white text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-gray-400 hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                <span className="text-sm">
                  123 Skill Street, Learning City, SC 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary-500 mr-2 flex-shrink-0" />
                <a 
                  href="mailto:support@skillswap.com" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  support@skillswap.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Skill Swap. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/privacy" className="text-xs text-gray-400 hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-xs text-gray-400 hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-xs text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;