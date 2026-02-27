import React, { useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ChevronDown } from 'lucide-react';
import about from "../assets/about.jpg";
import farm1 from "../assets/farm1.jpg"
import { px } from 'framer-motion';

// Interface for team member data
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
}

// About page component
const About: React.FC = () => {
  // State for controlling visible team members in mobile slider
  const [visibleTeamMembers, setVisibleTeamMembers] = useState<number>(3);

  // Sample team member data (replace with API fetch if needed)
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Emma Green',
      role: 'Founder & CEO',
      bio: 'Emma launched our microgreens venture with a vision for sustainable, healthy eating. She leads with passion and innovation.',
      image_url: 'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      name: 'Liam Carter',
      role: 'Head Farmer',
      bio: 'With over a decade in organic farming, Liam ensures our microgreens are grown with care and expertise.',
      image_url: 'https://images.pexels.com/photos/2345678/pexels-photo-2345678.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      name: 'Sophie Lee',
      role: 'Nutritionist',
      bio: 'Sophie curates our microgreen blends to boost health, sharing her knowledge with our community.',
      image_url: 'https://images.pexels.com/photos/3456789/pexels-photo-3456789.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '4',
      name: 'Noah Patel',
      role: 'Logistics Manager',
      bio: 'Noah keeps our supply chain green and efficient, delivering fresh microgreens to your door.',
      image_url: 'https://images.pexels.com/photos/4567890/pexels-photo-4567890.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  // Handler for "Show More" button in team slider
  const handleShowMore = () => {
    setVisibleTeamMembers(teamMembers.length);
  };

  // Inject styles dynamically to avoid external CSS file
  useLayoutEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes zoomIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .animate-slideInUp {
        animation: slideInUp 0.8s ease-out forwards;
        animation-delay: calc(var(--i) * 0.3s);
      }

      .animate-zoomIn {
        animation: zoomIn 0.8s ease-out forwards;
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
    <div className="min-h-screen font-sans bg-[#E8F5E9]">
      {/* Hero Section */}
      <section className="relative bg-[#1B5E20] py-20 lg:py-32 transform -skew-y-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transform skew-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInUp ">
              <h1 className="text-4xl lg:text-4xl font-medium text-[#FFFFFF] mb-6">
                Welcome to The Microgreen Guy
                <span className="text-[#FBC02D] block mt-3 ">Your Ultimate Source for Urban Farming Excellence</span>
              </h1>
              <p className="text-xl text-[#FFFFFF]/90 mb-8 leading-relaxed">
                Our mission is to bring green urban living to life by offering the freshest, most nutrient-packed microgreens grown right in the heart of the city. Utilizing innovative hydroponics technology and controlled environment agriculture, we ensure our produce is both eco-friendly and of the highest quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-full hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 shadow-lg focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
                  aria-label="Shop Now"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#FBC02D] text-[#FBC02D] font-semibold rounded-full hover:bg-[#FBC02D] hover:text-[#1B5E20] transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
                  aria-label="Contact Us"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="relative animate-zoomIn">
              <img
                src={about}
                alt="Microgreens Farm"
                className="w-full h-64 lg:h-96 object-cover rounded- shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute -bottom-6 -right-6 bg-[#FFFFFF] p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-[#FBC02D]" />
                  <span className="text-sm text-[#1B5E20] font-medium">Eco-Friendly Farming</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-[#FFFFFF] transform skew-y-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transform -skew-y-3">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-[#1B5E20] mb-4 animate-slideInUp">
              Our Story
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              From urban innovation to sustainable excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12">
            <div className="animate-slideInUp space-y-4">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Our microgreens are carefully cultivated using sustainable agriculture practices, making every batch a testament to sustainable city farming. Whether you’re interested in the health benefits of microgreens or the convenience of fresh greens delivery, we’ve got you covered. Our local urban farms provide a diverse range of specialty microgreens that are perfect for enhancing your meals and boosting your nutrition.
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Explore our vertical farming microgreens and discover how small space farming can make a big impact on your diet and the environment. From organic microgreens to home-grown greens, each variety is harvested at the peak of flavor, ensuring a burst of freshness in every bite.
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Embrace the benefits of nutritional greens supply from The Microgreen Guy, where eco-friendly farming and innovative agriculture come together to provide you with the best in urban greenery. Enjoy flavorful greens that elevate your dishes and support a sustainable world.
              </p>
            </div>
            <div className="animate-zoomIn">
              <img
                src={farm1} 
                alt="Microgreens Cultivation"
                className="w-full h-64 lg:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="animate-slideInUp space-y-4">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Our commitment to quality produce is unwavering. We carefully nurture our microgreens from seed to fresh harvest, ensuring they reach their peak flavor and nutritional potential. Each batch is delivered with freshness guaranteed, offering a delightful and nutritious addition to any meal. We cater to health enthusiasts and culinary innovators alike, providing a diverse range of specialty microgreens. Whether you’re a chef looking to elevate your dishes with flavorful greens or someone seeking the microgreen health benefits, our products are perfect for you.
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Join us in our urban agriculture initiative and experience the advantages of sustainable city farming. With fresh greens delivery from our local urban farms, you can enjoy the benefits of nutritional greens supply right at your doorstep. Our indoor farming techniques ensure that even small spaces can contribute to a greener world. This commitment to accessible, sustainable produce helps us create a community centered around health and environmental stewardship.
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                The Microgreen Guy is dedicated to making a positive impact on both health and the environment. Explore the wonders of organic microgreens and join us in cultivating a sustainable future, one leaf at a time. Our efforts are aimed at creating a healthier world through responsible farming practices, and we invite you to be a part of this journey. With our fresh, nutrient-rich microgreens, you can enhance your meals while supporting a greener planet. Let’s work together to build a vibrant, sustainable community, starting with the tiny but powerful microgreen.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#1B5E20] text-[#FFFFFF] font-semibold rounded-full hover:bg-[#FBC02D] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
                  aria-label="Explore Our Products"
                >
                  Explore Our Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-[#E8F5E9] transform -skew-y-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transform skew-y-3">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-[#1B5E20] mb-4 animate-slideInUp">
              Our Mission
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Blending urban farming with sustainability for a greener future.
            </p>
          </div>
          <div className="space-y-6 mb-12">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
              At The Microgreen Guy, our mission is to blend urban farming with sustainability, creating a future where fresh, nutrient-packed microgreens are accessible to everyone. Our passion lies in fostering wholesome living through eco-friendly farming methods. Using hydroponic systems, we grow our microgreens in a controlled environment, eliminating harmful chemicals and reducing water usage. This innovative agricultural approach ensures that our city agriculture practices are both sustainable and efficient. By transforming urban spaces into green sanctuaries, we promote green urban living and inspire communities to reconnect with nature.
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
              At The Microgreen Guy, we are redefining urban agriculture by transforming city spaces into lush, sustainable havens. Our goal is to ensure every city dweller has access to fresh, locally grown greens, making urban farming a staple of everyday life.
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
              We strive to be more than just providers of nutritious greens; we aim to be a force for positive change. By fostering a deeper connection between people and their food, we empower individuals to make choices that benefit both their health and the environment. Our innovative practices and dedication to eco-friendly farming inspire communities to see the potential of urban spaces for food production.
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed max-w-4xl mx-auto">
              Imagine rooftops with thriving gardens, abandoned lots turned into bustling urban farms, and windowsills filled with verdant microgreens. By promoting sustainability and wellness, we are planting the seeds for a greener, healthier future. Join us on this journey to create a vibrant and sustainable tomorrow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-[#FFFFFF] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInUp" style={{ '--i': 0 } as React.CSSProperties}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FBC02D]/20 rounded-full mb-6">
                <Leaf className="h-8 w-8 text-[#1B5E20]" />
              </div>
              <h3 className="text-xl font-medium text-[#1B5E20] mb-4">Nutrition</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Our microgreens provide essential nutrients, enhancing meals and boosting health with every bite.
              </p>
            </div>
            <div className="text-center p-8 rounded-lg bg-[#FFFFFF] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInUp" style={{ '--i': 1 } as React.CSSProperties}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FBC02D]/20 rounded-full mb-6">
                <Leaf className="h-8 w-8 text-[#1B5E20]" />
              </div>
              <h3 className="text-xl font-medium text-[#1B5E20] mb-4">Sustainability</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                We prioritize eco-friendly practices, reducing water usage and eliminating chemicals for a greener planet.
              </p>
            </div>
            <div className="text-center p-8 rounded-lg bg-[#FFFFFF] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-slideInUp" style={{ '--i': 2 } as React.CSSProperties}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FBC02D]/20 rounded-full mb-6">
                <Leaf className="h-8 w-8 text-[#1B5E20]" />
              </div>
              <h3 className="text-xl font-medium text-[#1B5E20] mb-4">Community</h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Building a community around health and sustainability through accessible, locally grown produce.
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-20 bg-[#1B5E20] transform skew-y-3">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 transform -skew-y-3">
          <h2 className="text-3xl lg:text-4xl font-medium text-[#FFFFFF] mb-6 animate-slideInUp">
            Join Us in Cultivating a Sustainable Future
          </h2>
          <p className="text-xl text-[#FFFFFF]/90 mb-8 leading-relaxed">
            Explore the wonders of organic microgreens and join us in cultivating a sustainable future, one leaf at a time. Our efforts are aimed at creating a healthier world through responsible farming practices, and we invite you to be a part of this journey. With our fresh, nutrient-rich microgreens, you can enhance your meals while supporting a greener planet. Let’s work together to build a vibrant, sustainable community, starting with the tiny but powerful microgreen.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-4 bg-[#FBC02D] text-[#1B5E20] font-semibold rounded-full hover:bg-[#FFFFFF] hover:text-[#1B5E20] transform hover:scale-105 transition-all duration-300 focus:ring-2 focus:ring-[#FBC02D] focus:ring-opacity-50 touch-manipulation"
            aria-label="Get Started Today"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;