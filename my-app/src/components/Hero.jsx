import React from 'react';
import { Star, ArrowRight, PlayCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <div className="max-w-lg mx-auto lg:mx-0">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 mb-6">
                <Star className="h-4 w-4 mr-2" />
                Trusted by over 10,000 Freelancers and Agencies Worldwide
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Build Amazing Proposals & Resumes with{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  BizMind AI
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10">
                Build AI Powered Proposals and Resumes that win more clients and land more projects—fast and easy.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-lg font-medium text-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center">
                  Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-gray-300 text-gray-800 px-8 py-4 rounded-lg font-medium text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center justify-center">
                  <PlayCircle className="mr-2 h-5 w-5" /> Watch Demo
                </button>
              </div>
              <div className="mt-10 flex items-center">
                <div className="flex -space-x-2 mr-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-indigo-500"
                    />
                  ))}
                </div>
                <div className="text-gray-600">
                  <p className="font-medium">Join 25,000+ developers</p>
                  <p className="text-sm">Already building with ReactPro</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="relative max-w-lg mx-auto lg:mx-0 lg:ml-auto">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-400 mr-2" />
                    <div className="h-3 w-3 rounded-full bg-amber-400 mr-2" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded" />
                    <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 to-gray-100 rounded" />
                    <div className="h-4 w-5/6 bg-gradient-to-r from-blue-200 to-blue-100 rounded" />
                    <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-100 rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                    <div className="text-2xl font-bold">+40%</div>
                    <div className="text-sm opacity-90">Productivity Gain</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="text-2xl font-bold">69.9%</div>
                    <div className="text-sm opacity-90">Uptime</div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 h-24 w-24 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -right-4 h-32 w-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
