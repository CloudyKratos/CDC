import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, Star, Users, Target, Clock, Zap, Trophy, Shield } from 'lucide-react';

const Onboarding = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const onboardingVideo = {
    title: "WARRIOR INITIATION",
    subtitle: "The Underground Blueprint to Unstoppable Success",
    duration: "8:47",
    thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop&crop=center",
    description: "This isn't another motivational video. This is the raw, unfiltered blueprint that 10,000+ warriors use to dominate their reality."
  };

  const stats = [
    { number: "10K+", label: "Warriors Transformed", icon: Users },
    { number: "97%", label: "Success Rate", icon: Trophy },
    { number: "90 Days", label: "Average Results", icon: Zap }
  ];

  const pillars = [
    {
      icon: Target,
      title: "PRECISION TARGETING",
      description: "Cut through the noise. Get laser-focused on what actually moves the needle.",
      gradient: "from-red-500/20 to-orange-500/20"
    },
    {
      icon: Shield,
      title: "BULLETPROOF MINDSET",
      description: "Build unshakeable mental armor that deflects doubt and amplifies confidence.",
      gradient: "from-blue-500/20 to-purple-500/20"
    },
    {
      icon: Zap,
      title: "EXECUTION ENGINE",
      description: "Transform from dreamer to doer with our battle-tested action framework.",
      gradient: "from-green-500/20 to-teal-500/20"
    }
  ];

  const handleVideoPlay = () => {
    console.log("Playing warrior initiation video");
    setVideoWatched(true);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Mouse-Following Gradient */}
        <div 
          className="absolute w-96 h-96 opacity-20 blur-3xl transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            left: mousePosition.x - 192,
            top: mousePosition.y - 192
          }}
        />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Graffiti Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 text-6xl font-black text-primary rotate-12 select-none">
            WARRIOR
          </div>
          <div className="absolute bottom-40 right-20 text-4xl font-black text-primary/60 -rotate-12 select-none">
            RISE UP
          </div>
          <div className="absolute top-1/2 left-10 text-2xl font-black text-primary/40 rotate-45 select-none">
            UNLEASH
          </div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          {/* Animated Badge */}
          <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <Badge className="mb-8 px-8 py-4 text-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 backdrop-blur-sm">
              <Star className="h-5 w-5 mr-2 animate-pulse" />
              EXCLUSIVE ACCESS GRANTED
            </Badge>
          </div>

          {/* Main Title */}
          <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-none tracking-tight">
              <span className="bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
                {onboardingVideo.title}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div className={`transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-xl md:text-3xl font-bold text-gray-300 mb-8 max-w-4xl mx-auto leading-tight">
              {onboardingVideo.subtitle}
            </p>
            
            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
              {onboardingVideo.description}
            </p>
          </div>

          {/* Stats Row */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16 transition-all duration-1000 delay-900 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${1000 + index * 100}ms` }}
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2 group-hover:animate-pulse" />
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.number}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className={`animate-bounce transition-all duration-1000 delay-1200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <ArrowRight className="h-6 w-6 text-primary mx-auto rotate-90" />
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-20 px-4">
        {/* Section Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />
        
        <div className="container mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              WATCH YOUR INITIATION
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              This video will change everything. No fluff, no BS, just pure value.
            </p>
          </div>

          {/* Video Card */}
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden bg-gray-900/50 border border-primary/20 shadow-2xl backdrop-blur-sm hover:shadow-primary/10 transition-all duration-500">
              <div className="relative group">
                <img 
                  src={onboardingVideo.thumbnail}
                  alt="Warrior initiation video"
                  className="w-full h-[300px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Video Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Play Button */}
                <button
                  onClick={handleVideoPlay}
                  className="absolute inset-0 flex items-center justify-center group/play"
                >
                  <div className="relative">
                    {/* Pulse Rings */}
                    <div className="absolute inset-0 animate-ping">
                      <div className="w-32 h-32 md:w-40 md:h-40 border-2 border-primary/50 rounded-full" />
                    </div>
                    <div className="absolute inset-0 animate-ping" style={{ animationDelay: '0.5s' }}>
                      <div className="w-32 h-32 md:w-40 md:h-40 border border-primary/30 rounded-full" />
                    </div>
                    
                    {/* Main Play Button */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl group-hover/play:scale-110 transition-all duration-300">
                      <Play className="h-12 w-12 md:h-16 md:w-16 text-black ml-2" fill="currentColor" />
                    </div>
                  </div>
                </button>

                {/* Video Info */}
                <div className="absolute bottom-8 left-8 right-8">
                  <Badge className="mb-4 gap-2 bg-black/70 text-white border-0 backdrop-blur-sm px-4 py-2">
                    <Clock className="h-4 w-4" />
                    {onboardingVideo.duration}
                  </Badge>
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-2">
                    THE WARRIOR BLUEPRINT
                  </h3>
                  <p className="text-gray-200 text-lg">
                    Everything you need to know to join the elite 1%
                  </p>
                </div>

                {/* Success Overlay */}
                {videoWatched && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto animate-scale-in">
                        <Trophy className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2">INITIATION COMPLETE</h4>
                      <p className="text-green-400 font-medium">Welcome to the warrior brotherhood</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
              THE THREE PILLARS
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Master these three elements and nothing can stop you
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pillars.map((pillar, index) => (
              <Card 
                key={index}
                className={`relative overflow-hidden bg-gradient-to-br ${pillar.gradient} border border-white/10 p-8 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group`}
                style={{ 
                  animationDelay: `${index * 200}ms`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 right-4 text-6xl font-black text-white rotate-12 select-none">
                    0{index + 1}
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <pillar.icon className="h-10 w-10 text-primary" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-4 text-center">
                    {pillar.title}
                  </h3>
                  
                  <p className="text-gray-300 text-center leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 px-4">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-black to-primary/5" />
        
        <div className="container mx-auto relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Graffiti Style Header */}
            <div className="mb-8">
              <h2 className="text-5xl md:text-7xl font-black mb-4 leading-none">
                <span className="bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent">
                  JOIN THE ELITE
                </span>
              </h2>
              <div className="text-2xl md:text-3xl font-bold text-gray-300 mb-8">
                This is your moment. Don't let it slip away.
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link to="/login" className="w-full sm:w-auto group">
                <Button 
                  size="lg" 
                  className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-black font-black text-xl px-12 py-6 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto border-2 border-primary/20"
                >
                  <ArrowRight className="h-6 w-6 mr-2 group-hover:translate-x-1 transition-transform" />
                  START YOUR TRANSFORMATION
                </Button>
              </Link>
              
              <Link to="/success-stories" className="w-full sm:w-auto group">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-bold text-xl px-12 py-6 rounded-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto backdrop-blur-sm"
                >
                  <Users className="h-6 w-6 mr-2 group-hover:animate-pulse" />
                  SEE WARRIOR STORIES
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="inline-flex items-center gap-3 bg-black/30 backdrop-blur-sm rounded-full px-8 py-4 border border-primary/20">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-white">
                Join <span className="text-primary font-black">10,847</span> elite warriors
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Onboarding;