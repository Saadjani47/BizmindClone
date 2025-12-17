import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileEdit from './ProfileEdit.jsx';
import PreferencesEdit from './PreferencesEdit.jsx';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
            <p className="mt-2 text-gray-600">Let’s set up your profile and preferences.</p>
            <div className="mt-4 text-sm text-gray-600">
              Step {step} of 2
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
                type="button"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                type="button"
                onClick={() => setStep(2)}
              >
                Next
              </button>
            ) : (
              <button
                className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                Finish
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          {step === 1 ? <ProfileEdit /> : <PreferencesEdit />}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
