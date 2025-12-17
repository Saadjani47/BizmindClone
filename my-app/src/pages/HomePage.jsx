import React, { useMemo } from 'react';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import FeaturesSection from '../components/FeaturesSection.jsx';
import TestimonialsSection from '../components/TestimonialsSection.jsx';
import CTASection from '../components/CTASection.jsx';
import Footer from '../components/Footer.jsx';
import { Zap, Shield, Globe, Users } from 'lucide-react';
import { isAuthenticated, logoutApi } from '../services/auth';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  const navItems = useMemo(() => {
    if (!authed) {
      return [
        { label: 'Home', to: '/' },
        { label: 'Features', to: '/features' },
        { label: 'Pricing', to: '/pricing' },
        { label: 'Sign In', to: '/login' },
        { label: 'Sign Up', to: '/signup' },
      ];
    }

    return [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Profile (View)', to: '/profile' },
      { label: 'Profile (Edit)', to: '/profile/edit' },
      { label: 'Preferences (View)', to: '/preferences' },
      { label: 'Preferences (Edit)', to: '/preferences/edit' },
      {
        label: 'Logout',
        to: '#logout',
        onClick: async (e) => {
          e.preventDefault();
          await logoutApi();
          navigate('/');
        },
      },
    ];
  }, [authed, navigate]);

  const features = [
    {
      icon: <Zap className="h-10 w-10" />,
      title: 'Lightning Fast',
      description: 'Optimized performance for seamless user experiences across all devices and platforms.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security protocols to protect your data and ensure 99.9% uptime.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: 'Global Reach',
      description: 'Scale your business worldwide with our distributed network and localization support.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Team Collaboration',
      description: 'Built-in tools to enhance team productivity and streamline communication workflows.',
      color: 'from-violet-500 to-purple-500',
    },
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'CTO, TechSolutions Inc.',
      content:
        'This platform transformed how our team collaborates. Productivity increased by 40% in the first quarter.',
      avatar: 'AJ',
      rating: 5,
    },
    {
      name: 'Maria Rodriguez',
      role: 'Product Manager, InnovateCo',
      content:
        "The scalability and reliability are unmatched. We've grown 3x without any infrastructure issues.",
      avatar: 'MR',
      rating: 5,
    },
    {
      name: 'David Chen',
      role: 'Founder, StartupLabs',
      content:
        'Implementation was seamless, and the support team is exceptional. Highly recommended!',
      avatar: 'DC',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar navItems={navItems} />
      <Hero />
      <FeaturesSection features={features} />
      <TestimonialsSection testimonials={testimonials} />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
