import React, { useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowRight } from 'lucide-react';

// Interface for Privacy Policy data
interface PrivacySection {
  id: string;
  title: string;
  content: string;
}

// Privacy Policy page component
const PrivacyPolicy: React.FC = () => {
  // Privacy Policy data
  const privacySections: PrivacySection[] = [
    {
      id: '1',
      title: 'Introduction',
      content:
        'Welcome to the privacy policy of Microgreen Guy Pvt Ltd. We are committed to protecting your privacy and ensuring the security of your personal information. By using our services, you agree to the terms and practices described in this policy.',
    },
    {
      id: '2',
      title: 'Information We Collect',
      content:
        'We collect the following types of information: Personal Information such as your name, address, email address, and phone number when you create an account or place an order; Payment Information, including credit card details, to process transactions; Order Information, including order history and delivery preferences; and Usage Information, such as your IP address, browser type, and device information.',
    },
    {
      id: '3',
      title: 'How We Use Your Information',
      content:
        'We use your information to process and fulfill orders, communicate with you about orders, promotions, and updates, and to analyze and improve our services, website, and user experience.',
    },
    {
      id: '4',
      title: 'Data Security',
      content:
        'We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.',
    },
    {
      id: '5',
      title: 'Sharing Your Information',
      content:
        'We do not sell or rent your personal information. We may share it with service providers and partners to facilitate our services or if required by law, to protect our rights, or in the event of a merger, acquisition, or sale of assets.',
    },
    {
      id: '6',
      title: 'Your Choices',
      content:
        'You may update, correct, or delete your account information at any time by logging into your account or contacting us. You can also opt out of promotional communications by following unsubscribe instructions in our emails or by contacting us.',
    },
    {
      id: '7',
      title: 'Cookies and Tracking Technologies',
      content:
        'We use cookies and similar technologies to collect information about your browsing activities. You can manage your cookie preferences through your browser settings.',
    },
    {
      id: '8',
      title: 'Children’s Privacy',
      content:
        'Our services are not intended for individuals under 18. We do not knowingly collect information from children under 18. If you believe a child has provided us with personal information, please contact us to have it removed.',
    },
    {
      id: '9',
      title: 'Changes to this Privacy Policy',
      content:
        'We may update this privacy policy to reflect changes in our data practices or legal requirements. We will notify you of significant changes via email or through our website.',
    },
  ];

  // Inject styles dynamically
  useLayoutEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .animate-scaleIn {
        animation: scaleIn 0.6s ease-out forwards;
        animation-delay: calc(var(--i) * 0.2s);
      }

      .animate-fadeInLeft {
        animation: fadeInLeft 0.6s ease-out forwards;
        animation-delay: calc(var(--i) * 0.2s);
      }

      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }

      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="min-h-screen font-sans bg-[#E8F5E9]">
      {/* Hero Section */}
      <section className="relative bg-[#1B5E20] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-scaleIn">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#FFFFFF] mb-6">
              Privacy Policy
              <span className="text-[#FBC02D] block">Your Data, Our Responsibility</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Learn how we collect, use, and protect your personal information.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-sm hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
              aria-label="Contact Us"
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section className="py-20 bg-[#FFFFFF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-scaleIn">
              Our Privacy Commitment
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Your privacy matters to us. Read our policy to understand our practices.
            </p>
          </div>
          <div className="space-y-8">
            {privacySections.map((section, index) => (
              <div
                key={section.id}
                className="bg-[#E8F5E9] p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 animate-fadeInLeft"
                style={{ '--i': index } as React.CSSProperties}
              >
                <h3 className="text-xl font-medium text-[#1B5E20] mb-4">{section.title}</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed bg-[#FFFFFF] p-4 rounded-sm">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-[#E8F5E9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-scaleIn">
              Questions About Our Policy?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Reach out to our team for more information or assistance.
            </p>
          </div>
          <div className="space-y-8 animate-fadeInLeft" style={{ '--i': 0 } as React.CSSProperties}>
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-[#FBC02D] mt-1" />
              <div>
                <h3 className="text-lg font-medium text-[#1B5E20]">Email</h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  <a href="mailto:talk2us@themicrogreenguy.com" className="hover:text-[#FBC02D] transition-colors">
                    talk2us@themicrogreenguy.com
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-[#FBC02D] mt-1" />
              <div>
                <h3 className="text-lg font-medium text-[#1B5E20]">Phone</h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  <a href="tel:+917569507659" className="hover:text-[#FBC02D] transition-colors">
                    +91 75695 07659
                  </a>
                </p>
              </div>
            </div>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1B5E20] text-[#FFFFFF] font-semibold rounded-sm hover:bg-[#FBC02D] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
                aria-label="Visit Contact Page"
              >
                Visit Contact Page
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1B5E20]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#FFFFFF] mb-6 animate-scaleIn">
            Shop Our Microgreens
          </h2>
          <p className="text-xl text-[#FFFFFF]/90 mb-8">
            Explore our fresh, sustainable microgreens with confidence in our privacy practices.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-sm hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
            aria-label="Shop Now"
          >
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;