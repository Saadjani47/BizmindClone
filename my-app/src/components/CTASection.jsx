import React from 'react';

const CTASection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Proposal Creation?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of freelancers who have accelerated their proposals with BizMind AI.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-white text-blue-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
              Start Free 14-Day Trial
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300">
              Schedule a Demo
            </button>
          </div>
          <p className="text-blue-200 mt-8 text-sm">
            No credit card required • Cancel anytime • 24/7 Support
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
