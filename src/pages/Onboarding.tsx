import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, Star, Users, Target, Clock } from 'lucide-react';

const Onboarding = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const onboardingVideo = {
    title: "Welcome to CDC Warriors",
    subtitle: "Your Journey to Consistency Starts Here",
    duration: "5:30",
    thumbnail: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=600&fit=crop",
    description: "Discover how thousands of warriors have transformed their lives through the power of consistency. This exclusive welcome video reveals the three pillars that will change everything for you."
  };

  const features = [
    {
      icon: Target,
      title: "Clear Direction",
      description: "Get crystal clear on what you want to achieve"
    },
    {
      icon: Users,
      title: "Community Support", 
      description: "Join a tribe of like-minded warriors"
    },
    {
      icon: Star,
      title: "Proven System",
      description: "Follow our battle-tested methodology"
    }
  ];

  const handleVideoPlay = () => {
    console.log("Playing onboarding video");
    setVideoWatched(true);
    // In a real implementation, this would track video engagement
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, hsl(var(--primary)) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%)`
          }} />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative">
          <div className="text-center mb-8">
            <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Badge variant="secondary" className="mb-6 px-6 py-3 text-base bg-primary/10 text-primary border-primary/20">
                <Star className="h-4 w-4 mr-2" />
                Exclusive Welcome Experience
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
                {onboardingVideo.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                {onboardingVideo.subtitle}
              </p>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {onboardingVideo.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Section */}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Card className={`overflow-hidden shadow-2xl border-2 border-primary/20 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative">
              <img 
                src={onboardingVideo.thumbnail}
                alt="Welcome video thumbnail"
                className="w-full h-[300px] md:h-[500px] object-cover"
              />
              
              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Play Button */}
              <button
                onClick={handleVideoPlay}
                className="absolute inset-0 flex items-center justify-center group hover:scale-105 transition-all duration-300"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-primary/25 group-hover:bg-white transition-all duration-300 border-4 border-white/20">
                  <Play className="h-10 w-10 md:h-12 md:w-12 text-primary ml-1" fill="currentColor" />
                </div>
              </button>

              {/* Duration Badge */}
              <Badge className="absolute top-6 right-6 gap-2 bg-black/70 text-white border-0 backdrop-blur-sm px-4 py-2">
                <Clock className="h-4 w-4" />
                {onboardingVideo.duration}
              </Badge>

              {/* Title Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Watch Your Welcome Video
                </h2>
                <p className="text-white/90 text-lg">
                  The first step to your transformation
                </p>
              </div>
            </div>
          </Card>

          {/* Video Action */}
          <div className={`text-center mt-8 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-muted-foreground mb-6 text-lg">
              Click the play button above to begin your warrior journey
            </p>
            
            {videoWatched && (
              <div className="animate-fade-in">
                <Badge variant="secondary" className="mb-4 px-4 py-2 bg-green-500/10 text-green-600 border-green-500/20">
                  <Star className="h-4 w-4 mr-1" />
                  Welcome Video Completed!
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className={`mt-20 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">What You'll Get as a Warrior</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a community that's committed to your success and transformation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10 hover:border-primary/20"
                style={{ animationDelay: `${800 + index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`mt-20 transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 p-8 md:p-12">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, hsl(var(--primary)) 0%, transparent 50%)`
              }} />
            </div>

            <div className="relative text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Transformation?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                After watching the welcome video, take the next step and join our warrior community today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="gap-2 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <ArrowRight className="h-5 w-5" />
                    Join Now - Get Started
                  </Button>
                </Link>
                <Link to="/success-stories" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2 px-8 py-4 text-lg border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 w-full sm:w-auto"
                  >
                    <Users className="h-5 w-5" />
                    See More Stories
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Join <span className="font-medium text-primary">2,500+</span> warriors who've started their journey
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;