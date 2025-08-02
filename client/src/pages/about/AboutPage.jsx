import React from 'react';
import { FaCode, FaDatabase, FaRobot, FaMap, FaSearch, FaChartLine, FaGraduationCap, FaLightbulb, FaCog, FaUsers } from 'react-icons/fa';

const AboutPage = () => {
  const technologies = [
    { name: 'React', category: 'Frontend', description: 'Modern UI with hooks and context' },
    { name: 'Node.js', category: 'Backend', description: 'RESTful API development' },
    { name: 'MongoDB', category: 'Database', description: 'NoSQL data management' },
    { name: 'Puppeteer', category: 'Automation', description: 'Web scraping and automation' },
    { name: 'Google Maps API', category: 'Integration', description: 'Interactive mapping' },
    { name: 'OpenCage API', category: 'Integration', description: 'Geocoding services' },
    { name: 'Express.js', category: 'Backend', description: 'Server framework' },
    { name: 'Tailwind CSS', category: 'Frontend', description: 'Responsive design' }
  ];

  const features = [
    {
      icon: <FaRobot className="text-blue-500" />,
      title: 'Automated Data Scraping',
      description: 'Built a comprehensive scraping system with cron jobs, error handling, and real-time monitoring',
      learnings: ['Web scraping techniques', 'Task scheduling', 'Error recovery systems']
    },
    {
      icon: <FaSearch className="text-green-500" />,
      title: 'Package Comparison Engine',
      description: 'Advanced search and filtering system for comparing travel packages across multiple providers',
      learnings: ['Search algorithms', 'Data aggregation', 'User experience design']
    },
    {
      icon: <FaMap className="text-red-500" />,
      title: 'Interactive Mapping',
      description: 'Google Maps integration with dynamic markers, clustering, and resort-package matching',
      learnings: ['API integration', 'Geospatial data', 'Performance optimization']
    },
    {
      icon: <FaChartLine className="text-purple-500" />,
      title: 'Analytics Dashboard',
      description: 'Real-time monitoring of scraping operations, user interactions, and system performance',
      learnings: ['Data visualization', 'Real-time updates', 'System monitoring']
    }
  ];

  const learningAreas = [
    {
      category: 'Full-Stack Development',
      skills: ['React ecosystem', 'Node.js backend', 'RESTful API design', 'Database modeling'],
      icon: <FaCode className="text-blue-600" />
    },
    {
      category: 'Data Engineering',
      skills: ['Web scraping', 'Data aggregation', 'ETL processes', 'Data validation'],
      icon: <FaDatabase className="text-green-600" />
    },
    {
      category: 'System Architecture',
      skills: ['Microservices', 'Cron scheduling', 'Error handling', 'Performance optimization'],
      icon: <FaCog className="text-orange-600" />
    },
    {
      category: 'User Experience',
      skills: ['Responsive design', 'Interactive components', 'Search UX', 'Mobile optimization'],
      icon: <FaUsers className="text-pink-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-hidden">
      {/* Decorative SVG/shape top left */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-20 z-0">
        {/* Add a playful SVG blob or cloud here */}
        {/* Example: <img src="/images/decor/blob-about.svg" alt="decor" /> */}
      </div>
      {/* Decorative SVG/shape bottom right */}
      <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
        {/* Add a playful SVG wave or cloud here */}
        {/* Example: <img src="/images/decor/wave-about.svg" alt="decor" /> */}
      </div>
      <div className="relative z-10 py-8">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <FaGraduationCap className="text-6xl text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              My Learning Journey
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              This travel agency platform represents my comprehensive exploration of modern web development, 
              data engineering, and system architecture. Every feature built has been a stepping stone in 
              mastering full-stack development.
            </p>
          </div>

          {/* Project Overview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <div className="flex items-center mb-6">
              <FaLightbulb className="text-3xl text-yellow-500 mr-4" />
              <h2 className="text-3xl font-bold text-gray-800">Project Vision</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">What I Built</h3>
                <p className="text-gray-600 leading-relaxed">
                  A comprehensive travel package comparison platform that aggregates data from multiple 
                  Malaysian travel providers. The system automatically scrapes, processes, and presents 
                  travel packages for popular destinations like Redang, Perhentian, and Tioman islands.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Why I Built It</h3>
                <p className="text-gray-600 leading-relaxed">
                  To challenge myself with real-world problems: data aggregation, automation, user experience, 
                  and system reliability. This project combines multiple complex technologies and demonstrates 
                  end-to-end software development skills.
                </p>
              </div>
            </div>
          </div>

          {/* Key Features & Learning */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Features & Learning Outcomes
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Key Learnings:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {feature.learnings.map((learning, idx) => (
                        <li key={idx}>{learning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Technology Stack Mastered
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {technologies.map((tech, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-2">{tech.name}</h3>
                  <p className="text-sm text-blue-600 mb-2">{tech.category}</p>
                  <p className="text-xs text-gray-600">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Areas */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Core Learning Areas
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {learningAreas.map((area, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{area.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800">{area.category}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {area.skills.map((skill, idx) => (
                      <span key={idx} className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Achievements */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Technical Achievements</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">3</div>
                <div className="text-lg">Data Sources Integrated</div>
                <div className="text-sm opacity-90">AmiTravel, HolidayGoGo, PulauMalaysia</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-lg">Automated Monitoring</div>
                <div className="text-sm opacity-90">Cron jobs with error recovery</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-lg">Mobile Responsive</div>
                <div className="text-sm opacity-90">Optimized for all devices</div>
              </div>
            </div>
          </div>

          {/* Future Learning Goals */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Continuous Learning Journey
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Next Steps</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Machine Learning for recommendation systems
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Advanced caching with Redis
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    Microservices architecture
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Cloud deployment and scaling
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Skills Developed</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Problem-solving and debugging
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    System design and architecture
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    User experience thinking
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    Performance optimization
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
