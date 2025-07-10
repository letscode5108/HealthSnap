"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Brain, 
  Trash2, 
  ExternalLink,
  Activity,
  Heart,
  Stethoscope,
  Menu,
  X,
  ChevronDown,
  Check,
 
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

const MedFlow = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'dashboard', 'pricing', 'faq'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart Upload",
      description: "Upload PDF reports and medical images instantly with Cloudinary integration"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Table Reports",
      description: "View all your medical reports in organized, searchable table format"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Trend Analysis",
      description: "Track parameter changes over time with interactive graphs and charts"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Insights",
      description: "Get intelligent analysis and recommendations based on your reports"
    },
    {
      icon: <ExternalLink className="w-8 h-8" />,
      title: "Quick Access",
      description: "View PDFs directly through secure Cloudinary URLs with one click"
    },
    {
      icon: <Trash2 className="w-8 h-8" />,
      title: "Report Management",
      description: "Easily delete and manage your medical reports with full control"
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "$9",
      period: "/month",
      description: "Perfect for individuals",
      features: [
        "Upload up to 50 reports/month",
        "Basic trend analysis",
        "Email support",
        "PDF view access",
        "Standard AI insights"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "For healthcare professionals",
      features: [
        "Unlimited report uploads",
        "Advanced trend analysis",
        "Priority support",
        "Bulk operations",
        "Advanced AI insights",
        "Custom parameters",
        "Export capabilities"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For medical institutions",
      features: [
        "Multi-user dashboard",
        "Advanced analytics",
        "24/7 phone support",
        "API access",
        "Custom integrations",
        "Compliance reports",
        "Dedicated account manager"
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How secure is my medical data?",
      answer: "We use enterprise-grade encryption and comply with HIPAA standards. All data is stored securely with Cloudinary's medical-grade infrastructure."
    },
    {
      question: "What file formats do you support?",
      answer: "We support PDF documents and common image formats (JPEG, PNG, TIFF) for medical reports and scans."
    },
    {
      question: "How does the AI insights feature work?",
      answer: "Our AI analyzes patterns in your reports, identifies trends in key parameters, and provides personalized health insights based on medical best practices."
    },
    {
      question: "Can I export my data?",
      answer: "Yes! Professional and Enterprise plans include data export capabilities in multiple formats including PDF, CSV, and JSON."
    },
    {
      question: "Do you offer integration with other medical systems?",
      answer: "Enterprise plans include API access and custom integrations with popular EMR systems and medical databases."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                MedFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'Features', 'Dashboard', 'Pricing', 'FAQ'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    activeSection === item.toLowerCase()
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            
          
          
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-blue-100">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {['Home', 'Features', 'Dashboard', 'Pricing', 'FAQ'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md w-full text-left"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <Heart className="w-12 h-12 text-red-500 " />
              <Activity className="w-16 h-16 text-blue-600" />
              <Stethoscope className="w-12 h-12 text-green-500" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
              Smart Medical
              <br />
              Report Management
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your medical reports into actionable insights. Upload, analyze, and track your health parameters with AI-powered intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link  href="/login"
               
                className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Activity className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
              <Link
  href="/register"
               
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                SignUp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Better Health Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage, analyze, and understand your medical reports in one intelligent platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-100"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-xl w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Medical Dashboard</h2>
            <p className="text-xl text-gray-600">Experience the future of medical report management</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
            {/* Dashboard Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-blue-600" />
                  <span>Medical Reports Dashboard</span>
                </h3>
                <p className="text-gray-600 mt-1">Manage and analyze your health data</p>
              </div>
              <div className="flex space-x-4">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Report</span>
                </button>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Insights</span>
                </button>
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Recent Reports</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Report Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Key Parameter</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-blue-100 hover:bg-blue-25">
                      <td className="py-3 px-4 text-gray-900">May 4, 2025</td>
                      <td className="py-3 px-4 text-gray-700">Blood Test</td>
                      <td className="py-3 px-4 text-gray-700">Cholesterol</td>
                      <td className="py-3 px-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">185 mg/dL</span></td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800"><ExternalLink className="w-4 h-4" /></button>
                          <button className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100 hover:bg-blue-25">
                      <td className="py-3 px-4 text-gray-900">June 9, 2025</td>
                      <td className="py-3 px-4 text-gray-700">Blood Test</td>
                      <td className="py-3 px-4 text-gray-700">Cholesterol</td>
                      <td className="py-3 px-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">210 mg/dL</span></td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800"><ExternalLink className="w-4 h-4" /></button>
                          <button className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Parameter Trends</span>
                </h4>
                <div className="h-48 bg-white rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                    <p>Interactive trend charts will appear here</p>
                    <p className="text-sm">Track changes from May 4 to June 9</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Health Insights</span>
                </h4>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-400">
                    <p className="text-gray-700"><strong>⚠️ Attention:</strong> Cholesterol levels increased by 13.5% since last test</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
                    <p className="text-gray-700"><strong>💡 Recommendation:</strong> Consider dietary adjustments and regular exercise</p>
                  </div>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition-all duration-300">
                    Get Detailed AI Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Health Plan</h2>
            <p className="text-xl text-gray-600">Affordable pricing for every healthcare need</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-3xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white transform scale-105 shadow-2xl'
                    : 'bg-gradient-to-br from-gray-50 to-blue-50 border border-blue-100 hover:shadow-xl'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                    Most Popular
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-green-300' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-blue-100' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about MedFlow</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-blue-50 transition-all duration-300"
                >
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-blue-600 transform transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">MedFlow</span>
              </div>
              <p className="text-gray-400">
                Transforming healthcare through intelligent report management and AI-powered insights.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Smart Upload</li>
                <li>AI Insights</li>
                <li>Trend Analysis</li>
                <li>Report Management</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Security</h4>
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-5 h-5" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 mt-2">
                <Clock className="w-5 h-5" />
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MedFlow. All rights reserved. Your health data, secured and intelligent.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MedFlow;