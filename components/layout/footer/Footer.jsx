import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4"> 
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2d3748] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">ET</span>
            </div>
            <span className="font-semibold text-white">EnterTrack</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-white transition-colors">
              Sobre
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Termos
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} EnterTrack. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;