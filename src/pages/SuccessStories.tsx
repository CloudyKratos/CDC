import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, User, Star, Trophy, Target, TrendingUp } from 'lucide-react';

const SuccessStories = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { icon: User, label: "Warriors Transformed", value: "2,500+" },
    { icon: Trophy, label: "Success Stories", value: "150+" },
    { icon: Target, label: "Goals Achieved", value: "10,000+" },
    { icon: TrendingUp, label: "Average Growth", value: "400%" }
  ];

  const videoTestimonials = [
    {
      id: 1,
      title: "From Procrastination to Powerhouse",
      author: "Michael K.",
      role: "Entrepreneur", 
      duration: "2:45",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
      description: "Michael shares how the CDC philosophy transformed his business and personal life in just 8 months.",
      tags: ["Business", "Mindset", "Consistency"]
    },
    {
      id: 2,
      title: "Fitness Coach's Breakthrough", 
      author: "Sarah T.",
      role: "Fitness Coach",
      duration: "3:20",
      thumbnail: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=400&h=300&fit=crop&crop=face",
      description: "How daily accountability helped Sarah double her client base and transform her coaching approach.",
      tags: ["Fitness", "Business Growth", "Accountability"]
    },
    {
      id: 3,
      title: "Building Million Dollar Habits",
      author: "David L.", 
      role: "Business Owner",
      duration: "4:15",
      thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face",
      description: "David's journey from inconsistent results to building systems that generated 7-figure success.",
      tags: ["Systems", "Growth", "Success"]
    },
    {
      id: 4,
      title: "Student to Success Story",
      author: "Emma R.",
      role: "College Student", 
      duration: "2:30",
      thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face",
      description: "How Emma balanced academics, fitness, and side hustles using CDC principles.",
      tags: ["Student Life", "Balance", "Achievement"]
    },
    {
      id: 5,
      title: "Corporate Executive's Transformation",
      author: "James M.",
      role: "VP of Operations",
      duration: "3:45", 
      thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop&crop=face",
      description: "From burnout to breakthrough - James shares his leadership transformation story.",
      tags: ["Leadership", "Corporate", "Transformation"]
    },
    {
      id: 6,
      title: "Mother of Three's Victory",
      author: "Lisa P.",
      role: "Stay-at-Home Mom",
      duration: "3:10",
      thumbnail: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=300&fit=crop&crop=face", 
      description: "Lisa proves that consistency works even with the busiest schedule imaginable.",
      tags: ["Parenting", "Time Management", "Personal Growth"]
    }
  ];

  const handleVideoPlay = (videoId: number, title: string) => {
    // In a real implementation, this would open a video modal or navigate to video player
    console.log(`Playing video ${videoId}: ${title}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header with Animation */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, hsl(var(--primary)) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, hsl(var(--primary)) 0%, transparent 50%),
                              radial-gradient(circle at 40% 40%, hsl(var(--primary)) 0%, transparent 50%)`
          }} />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative">
          <div className={`flex items-center gap-4 mb-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                <Star className="h-3 w-3 mr-1" />
                Real Stories, Real Results
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Success Stories
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Witness the extraordinary transformations of our warrior community. These aren't just stories—they're proof that consistency creates champions.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className={`mb-12 text-center transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Transformation Stories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Click on any story to watch how these warriors transformed their lives through the power of consistency and community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {videoTestimonials.map((video, index) => (
            <Card 
              key={video.id} 
              className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-2 border-transparent hover:border-primary/20 ${isLoaded ? 'animate-fade-in opacity-100' : 'opacity-0'}`}
              style={{ animationDelay: `${800 + index * 150}ms` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={video.thumbnail}
                  alt={`${video.author} testimonial`}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-500" />
                
                {/* Enhanced Play Button */}
                <button
                  onClick={() => handleVideoPlay(video.id, video.title)}
                  className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-primary/25 group-hover:bg-white transition-all duration-300 border-4 border-white/20">
                    <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                  </div>
                </button>

                {/* Enhanced Duration Badge */}
                <Badge variant="secondary" className="absolute top-4 right-4 gap-1 bg-black/70 text-white border-0 backdrop-blur-sm">
                  <Clock className="h-3 w-3" />
                  {video.duration}
                </Badge>

                {/* Success Badge */}
                <Badge className="absolute top-4 left-4 gap-1 bg-green-500/90 text-white border-0 backdrop-blur-sm">
                  <Trophy className="h-3 w-3" />
                  Success
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {video.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{video.author}</span>
                    <span className="text-muted-foreground"> • {video.role}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {video.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {video.tags.map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex} 
                      variant="outline" 
                      className="text-xs border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <Button 
                  onClick={() => handleVideoPlay(video.id, video.title)}
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  <Play className="h-4 w-4" />
                  Watch Transformation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className={`relative mt-20 transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8 md:p-12">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%),
                                  radial-gradient(circle at 75% 75%, hsl(var(--primary)) 0%, transparent 50%)`
              }} />
            </div>

            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Star className="h-4 w-4" />
                Your Journey Starts Here
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                Ready to Write Your Success Story?
              </h2>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Join thousands of warriors who have transformed their lives through the power of consistency. Your breakthrough is just one decision away.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link to="/onboarding" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="gap-2 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                  >
                    <Trophy className="h-5 w-5" />
                    Join the Warriors
                  </Button>
                </Link>
                <Link to="/" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2 px-8 py-4 text-lg border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 w-full sm:w-auto"
                  >
                    <TrendingUp className="h-5 w-5" />
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">2,500+</span> warriors have already started their transformation
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;