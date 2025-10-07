import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Share Skills, Grow Together
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            The platform where people exchange skills and knowledge through one-on-one sessions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">List the skills you can teach and what you want to learn.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Match With Others</h3>
              <p className="text-gray-600">Find someone who teaches what you want to learn and vice versa.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="bg-primary-100 text-primary-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Swap Skills</h3>
              <p className="text-gray-600">Schedule sessions and start teaching each other valuable skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-16 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Popular Skills on the Platform</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Programming', 'Graphic Design', 'Language Learning', 'Music',
              'Cooking', 'Photography', 'Marketing', 'Fitness'].map(skill => (
              <div key={skill} className="bg-white p-4 rounded-lg text-center border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all">
                <p className="font-medium">{skill}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-200">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah J.',
                quote: 'I taught Spanish while learning web development. It&apos;s been an amazing experience!',
              },
              {
                name: 'Michael T.',
                quote: 'Found someone to exchange guitar lessons for cooking classes. Best decision ever.',
              },
              {
                name: 'Priya M.',
                quote: 'The platform made it so easy to find someone to practice language exchange with.',
              }
            ].map(testimonial => (
              <div key={testimonial.name} className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <p className="font-medium">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600 text-white mb-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start swapping skills?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of lifelong learners today and start exchanging knowledge.
          </p>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;