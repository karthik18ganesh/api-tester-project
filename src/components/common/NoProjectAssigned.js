import React from 'react';
import { FiInfo, FiUser, FiMail } from 'react-icons/fi';

/**
 * Component to display when a regular user has no projects assigned
 * This provides clear messaging and guidance on what to do next
 */
const NoProjectAssigned = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="bg-amber-100 rounded-full p-4 inline-flex mb-6">
            <FiInfo className="h-8 w-8 text-amber-600" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Projects Assigned
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            You need to be assigned to a project by your administrator to access the application features. 
            All your work will be associated with the project you're assigned to.
          </p>
          
          {/* What you can do */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <FiUser className="mr-2" />
              What you can do:
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>• Contact your administrator to get assigned to a project</li>
              <li>• Provide your administrator with your user ID and role</li>
              <li>• Wait for project assignment confirmation</li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <FiMail className="mr-2" />
              <span>Contact your administrator for project assignment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoProjectAssigned; 