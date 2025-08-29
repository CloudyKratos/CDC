import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, Star, Users, Target, Clock, Zap, Trophy, Shield, CheckCircle, TrendingUp, Award } from 'lucide-react';

const Onboarding = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const onboardingVideo = {
    title: "Join the Elite CDC Warriors Community",
    subtitle: "Where ambitious entrepreneurs transform into unstoppable forces",
    duration: "8:42",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop&crop=center",
    description: "Discover how CDC Warriors has created a brotherhood of high-achievers who dominate their industries and build generational wealth."
  };

  const results = [
    { metric: "5,000+", label: "Active Warriors", icon: Users },
    { metric: "$50M+", label: "Total Member Revenue", icon: TrendingUp },
    { metric: "98%", label: "Success Rate", icon: Trophy }
  ];

  const systemComponents = [
    {
      step: "01",
      title: "Warrior Mindset Training",
      description: "Develop the unbreakable mental framework of a true CDC Warrior - resilience, discipline, and relentless pursuit of excellence.",
      benefits: [
        "Master high-performance psychology",
        "Build unshakeable confidence", 
        "Develop warrior-level discipline"
      ]
    },
    {
      step: "02", 
      title: "Elite Network Access",
      description: "Connect with a brotherhood of successful entrepreneurs who push each other to new heights and share million-dollar insights.",
      benefits: [
        "Access to exclusive mastermind sessions",
        "Direct mentorship from 7-8 figure earners",
        "Lifetime connections and partnerships"
      ]
    },
    {
      step: "03",
      title: "Wealth Creation Systems",
      description: "Learn the exact strategies and systems our Warriors use to generate multiple income streams and build generational wealth.",
      benefits: [
        "Proven business model blueprints",
        "Advanced scaling methodologies", 
        "Investment and wealth protection strategies"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Alex Rodriguez",
      role: "CDC Warrior",
      result: "Built 3 income streams",
      quote: "CDC Warriors transformed my entire mindset. I went from broke to building multiple 6-figure income streams in 18 months.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Jessica Park", 
      role: "Elite Warrior",
      result: "$100K+ per month",
      quote: "The brotherhood and systems inside CDC Warriors are unmatched. This community literally changed my life forever.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const handleVideoPlay = () => {
    console.log("Playing onboarding training video");
    setVideoWatched(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-black">CDC WARRIORS</div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 mr-1" />
              Invited Access
            </Badge>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Badge className="mb-8 px-6 py-3 bg-black text-white text-sm font-medium">
              EXCLUSIVE TRAINING • LIMITED ACCESS
            </Badge>
          </div>

          {/* Main Headline */}
          <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
              {onboardingVideo.title}
            </h1>
          </div>

          {/* Subheadline */}
          <div className={`transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-medium">
              {onboardingVideo.subtitle}
            </p>
            
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed mb-12">
              {onboardingVideo.description}
            </p>
          </div>

          {/* Results Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {results.map((result, index) => (
              <div key={index} className="text-center">
                <result.icon className="h-8 w-8 text-black mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">{result.metric}</div>
                <div className="text-gray-500 font-medium">{result.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          {/* Video Container */}
          <Card className="overflow-hidden shadow-2xl">
            <div className="relative">
              <img 
                src={onboardingVideo.thumbnail}
                alt="Training video preview"
                className="w-full h-[300px] md:h-[600px] object-cover"
              />
              
              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Play Button */}
              <button
                onClick={handleVideoPlay}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Play className="h-10 w-10 md:h-12 md:w-12 text-black ml-1" fill="currentColor" />
                </div>
              </button>

              {/* Video Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <Badge className="mb-3 gap-2 bg-black/70 text-white">
                  <Clock className="h-4 w-4" />
                  {onboardingVideo.duration}
                </Badge>
                 <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                   Discover the CDC Warriors System
                 </h2>
                 <p className="text-white/90">
                   See how our elite community transforms ambitious entrepreneurs
                 </p>
              </div>

              {/* Completion Overlay */}
              {videoWatched && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                  <div className="text-center text-white">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Training Complete</h3>
                    <p className="text-gray-300">Ready to take the next step?</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Call to Action Below Video */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-8">
              Watch the complete training above to see the exact system in action
            </p>
          </div>
        </div>
      </section>

      {/* System Breakdown Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
              The CDC Warriors System
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The 3 pillars that every CDC Warrior masters to achieve unstoppable success
            </p>
          </div>

          {/* System Steps */}
          <div className="space-y-16">
            {systemComponents.map((component, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-12 items-center">
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="text-6xl font-black text-gray-100 mb-4">{component.step}</div>
                  <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                    {component.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {component.description}
                  </p>
                  <ul className="space-y-3">
                    {component.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                  <Card className="p-8 bg-gradient-to-br from-gray-50 to-white shadow-lg">
                    <div className="aspect-square bg-gradient-to-br from-black to-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-4xl font-bold mb-2">{component.step}</div>
                        <div className="text-sm opacity-80">SYSTEM COMPONENT</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Real Results from Real Students
            </h2>
            <p className="text-lg text-gray-600">
              See what others have achieved using this exact system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 shadow-lg">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-bold text-black">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                    <Badge className="mt-1 bg-green-100 text-green-800">
                      {testimonial.result}
                    </Badge>
                  </div>
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your Empire?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join the thousands of entrepreneurs who have transformed their lives using this proven system.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/login" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 font-bold text-lg px-12 py-4 w-full sm:w-auto transition-all duration-300 hover:scale-105"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            
            <Link to="/success-stories" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-black font-medium text-lg px-12 py-4 w-full sm:w-auto transition-all duration-300"
              >
                <Users className="h-5 w-5 mr-2" />
                More Success Stories
              </Button>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 text-gray-400">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>Trusted by <span className="text-white font-semibold">10,000+</span> entrepreneurs worldwide</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Onboarding;