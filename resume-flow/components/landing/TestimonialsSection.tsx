export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      image: "/api/placeholder/64/64",
      quote: "ResumeFlow helped me identify key weaknesses in my resume that I never noticed. After implementing their suggestions, I got 5 interview calls in just 2 weeks!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Marketing Manager at Microsoft",
      image: "/api/placeholder/64/64",
      quote: "The AI-powered interview prep was a game-changer. The questions were spot-on for my industry, and the feedback helped me feel confident going into interviews.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist at Amazon",
      image: "/api/placeholder/64/64",
      quote: "I was struggling to get past ATS systems. ResumeFlow's optimization suggestions helped my resume get noticed, and I landed my dream job within a month!",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how ResumeFlow has helped professionals like you land their dream jobs 
            and advance their careers.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${
                index === 0 
                  ? 'from-indigo-50 to-indigo-100' 
                  : index === 1 
                  ? 'from-green-50 to-green-100'
                  : 'from-purple-50 to-purple-100'
              } rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                  <span className="text-gray-600 font-semibold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-indigo-600 mb-1">92%</div>
                <div className="text-gray-600 text-sm">Report Better Interviews</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">3.2x</div>
                <div className="text-gray-600 text-sm">More Interview Calls</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">78%</div>
                <div className="text-gray-600 text-sm">Land Dream Job</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">2 Weeks</div>
                <div className="text-gray-600 text-sm">Average Time to Offer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}