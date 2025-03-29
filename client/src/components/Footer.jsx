import React from "react";
import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 p-6 mt-12 bg-black/35">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="bg-gradient-to-br dark:from-green-900 dark:to-green-700
            rounded-full p-2 mr-2">
              {/* <Leaf className="h-5 w-5 text-green-100" /> */}
              <img src="https://cdn-icons-png.flaticon.com/512/7963/7963920.png" alt="icon" height={25} width={25} />
            </div>
            <span className="text-lg font-semibold text-white">Krishi Dhaara</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2025 Krishi Dhaara. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
