import React, { useState, useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Mail, Phone, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa'; // Import WhatsApp icon
import { API_BASE_URL } from '../config'; // Assume this exports the user backend URL

// Interface for FAQ data
interface FAQItem {
  id: number; // Changed to number for DB serial
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

// FAQ page component
const FAQ: React.FC = () => {
  // State for FAQ toggle
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch FAQs dynamically
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/faqs`);
        if (!response.ok) throw new Error('Failed to fetch FAQs');
        const data: FAQItem[] = await response.json();
        setFaqs(data);
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // Toggle FAQ item
  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Inject styles dynamically
  useLayoutEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes expand {
        from {
          max-height: 0;
          opacity: 0;
        }
        to {
          max-height: 200px;
          opacity: 1;
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
        animation-delay: calc(var(--i) * 0.2s);
      }

      .animate-expand {
        animation: expand 0.4s ease-out forwards;
      }

      .animate-collapse {
        animation: expand 0.4s ease-out reverse forwards;
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading FAQs...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen font-sans bg-[#E8F5E9]">
      {/* Hero Section */}
      <section className="relative bg-[#1B5E20] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fadeIn">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#FFFFFF] mb-6">
              Frequently Asked Questions
              <span className="text-[#FBC02D] block">All About Microgreens</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Find answers to common questions about our microgreens, shipping, and more.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-lg hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
              aria-label="Contact Us"
            >
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#FFFFFF]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-fadeIn">
              Your Questions, Answered
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Explore our FAQs to learn more about microgreens and our services.
            </p>
          </div>
          {faqs.length === 0 ? (
            <p className="text-center text-gray-600">No FAQs available at the moment.</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="bg-[#E8F5E9] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 animate-fadeIn"
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
                    aria-expanded={openFAQ === faq.id}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <h3 className="text-lg font-medium text-[#1B5E20]">{faq.question}</h3>
                    {openFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-[#FBC02D]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#FBC02D]" />
                    )}
                  </button>
                  <div
                    id={`faq-answer-${faq.id}`}
                    className={`overflow-hidden ${openFAQ === faq.id ? 'animate-expand' : 'animate-collapse max-h-0'}`}
                  >
                    <p className="p-4 text-gray-700 text-sm sm:text-base bg-[#FFFFFF] rounded-b-lg">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-[#E8F5E9]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-[#1B5E20] mb-4 animate-fadeIn">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Reach out to our team for personalized assistance.
            </p>
          </div>
          <div className="space-y-8 animate-fadeIn" style={{ '--i': 0 } as React.CSSProperties}>
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
                  <a href="tel:+91-7569507659" className="hover:text-[#FBC02D] transition-colors">
                    +91-7569507659
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaWhatsapp className="h-6 w-6 text-[#FBC02D] mt-1" />
              <div>
                <h3 className="text-lg font-medium text-[#1B5E20]">WhatsApp</h3>
                <p className="text-gray-700 text-sm sm:text-base">
                  <a href="https://wa.me/917569507659" className="hover:text-[#FBC02D] transition-colors">
                    +91-7569507659
                  </a>
                </p>
              </div>
            </div>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1B5E20] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#FBC02D] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
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
          <h2 className="text-3xl lg:text-4xl font-semibold text-[#FFFFFF] mb-6 animate-fadeIn">
            Ready to Try Our Microgreens?
          </h2>
          <p className="text-xl text-[#FFFFFF]/90 mb-8">
            Explore our fresh, nutrient-packed microgreens and elevate your meals.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-lg hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
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

export default FAQ;