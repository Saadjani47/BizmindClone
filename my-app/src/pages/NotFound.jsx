import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-gray-600">The page you are looking for does not exist.</p>
        <Link to="/" className="inline-block mt-8 text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg">
          Go Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
