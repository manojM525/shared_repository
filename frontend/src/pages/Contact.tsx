import React, { useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitMessage('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send message');
      }

      const data = await response.json();
      setSubmitMessage(data.message);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      setSubmitMessage(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useLayoutEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.7);
        }
        50% {
          opacity: 0.5;
          transform: scale(1.1);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .animate-bounceIn {
        animation: bounceIn 0.8s ease-out forwards;
        animation-delay: calc(var(--i) * 0.3s);
      }

      .animate-slideInLeft {
        animation: slideInLeft 0.8s ease-out forwards;
        animation-delay: calc(var(--i) * 0.3s);
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
    <>
      {/* Hero Section */}
      <section className="relative bg-[#1B5E20] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-bounceIn">
            <h1 className="text-4xl lg:text-5xl font-semibold text-[#FFFFFF] mb-6">
              Connect with The Microgreen Guy
              <span className="text-[#FBC02D] block">We’re Here to Help</span>
            </h1>
            <p className="text-xl text-[#FFFFFF]/90 max-w-2xl mx-auto mb-8 leading-relaxed">
              Got questions about our microgreens or need support? Our team is ready to assist you in your journey to sustainable, healthy living.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-lg hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
              aria-label="Shop Our Microgreens"
            >
              Shop Our Microgreens
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-20 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-slideInLeft" style={{ '--i': 0 } as React.CSSProperties & { [key: string]: any }}>
              <h2 className="text-3xl font-semibold text-[#1B5E20] mb-6">Send Us a Message</h2>
              <div className="bg-[#E8F5E9] p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#1B5E20] mb-2">
                      Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-[#1B5E20]/20 bg-[#FFFFFF] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 transition-all duration-200"
                      placeholder="Your Name"
                      aria-label="Name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1B5E20] mb-2">
                      Email*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-[#1B5E20]/20 bg-[#FFFFFF] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 transition-all duration-200"
                      placeholder="Your Email"
                      aria-label="Email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#1B5E20] mb-2">
                      Subject*
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border border-[#1B5E20]/20 bg-[#FFFFFF] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 transition-all duration-200"
                      placeholder="Subject"
                      aria-label="Subject"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#1B5E20] mb-2">
                      Your Message*
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full p-3 rounded-lg border border-[#1B5E20]/20 bg-[#FFFFFF] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 transition-all duration-200"
                      placeholder="Your Message"
                      aria-label="Message"
                      required
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full px-8 py-4 bg-[#1B5E20] text-[#FFFFFF] font-semibold rounded-lg hover:bg-[#FBC02D] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Send Message"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                  {submitMessage && (
                    <p
                      className={`text-sm mt-4 ${
                        submitMessage.includes('successfully') ? 'text-[#1B5E20]' : 'text-red-600'
                      }`}
                    >
                      {submitMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="animate-slideInLeft" style={{ '--i': 1 } as React.CSSProperties & { [key: string]: any }}>
              <h2 className="text-3xl font-semibold text-[#1B5E20] mb-6">Contact Information</h2>
              <div className="space-y-8">
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
                  <MapPin className="h-6 w-6 text-[#FBC02D] mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-[#1B5E20]">Operational Hours</h3>
                    <p className="text-gray-700 text-sm sm:text-base">
                      Saturday – Sunday: 09:00 AM – 06:00 PM
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-[#1B5E20] mb-4">Follow Us</h3>
                  <div className="flex space-x-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    <a
                      href="https://www.facebook.com/profile.php?id=61552852017197"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#E8F5E9] rounded-lg hover:bg-[#FBC02D] hover:text-[#1B5E20] transition-all duration-200"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5 text-[#1B5E20]" />
                    </a>
                    <a
                      href="https://instagram.com/themicrogreenguy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#E8F5E9] rounded-lg hover:bg-[#FBC02D] hover:text-[#1B5E20] transition-all duration-200"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5 text-[#1B5E20]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1B5E20] transform skew-y-3">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 transform -skew-y-3">
          <h2 className="text-3xl lg:text-4xl font-medium text-[#FFFFFF] mb-6 animate-bounceIn">
            Join the Microgreen Movement
          </h2>
          <p className="text-xl text-[#FFFFFF]/90 mb-8 leading-relaxed">
            Start your journey to sustainable, healthy eating with our fresh microgreens. Contact us today to learn more!
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-lg hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
            aria-label="Explore Our Microgreens"
          >
            Explore Our Microgreens
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default Contact;