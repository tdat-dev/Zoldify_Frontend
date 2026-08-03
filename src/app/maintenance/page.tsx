import React from 'react';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <Wrench className="w-20 h-20 text-yellow-500 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Website đang bảo trì
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-300 max-w-md mx-auto mb-8">
          Chúng tôi đang nâng cấp hệ thống. Vui lòng quay lại sau!
        </p>

        {/* Decorative Line */}
        <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto mb-8"></div>

        {/* Contact Info */}
        <p className="text-gray-400 text-sm">
          Nếu cần hỗ trợ, vui lòng liên hệ:{" "}
          <a href="mailto:admin@zoldify.com" className="text-yellow-500 hover:underline">
            admin@zoldify.com
          </a>
        </p>
      </div>
    </div>
  );
}
