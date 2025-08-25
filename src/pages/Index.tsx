import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/home/FeatureCard";
import { FeaturePoint } from "@/components/home/FeaturePoint";
import { FeatureBadge } from "@/components/home/FeatureBadge";
import Icons from "@/utils/IconUtils";
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import EnhancedCommunityChat from '@/components/community/EnhancedCommunityChat';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeWarriors, setActiveWarriors] = useState(0);
  const [animateWarriors, setAnimateWarriors] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const testimonials = [
    {
      quote: "The CDC philosophy changed everything for me. I stopped waiting for motivation and started showing up every day, no matter what.",
      author: "Michael K.",
      role: "Entrepreneur",
      duration: "8 months in community",
      avatar: "M"
    },
    {
      quote: "The daily accountability has been game-changing. Knowing other warriors are expecting me to show up pushes me through the resistance.",
      author: "Sarah T.",
      role: "Fitness Coach",
      duration: "1 year in community",
      avatar: "S"
    },
    {
      quote: "Consistency became my superpower. Small daily actions compound into extraordinary results when you stick with them.",
      author: "David L.",
      role: "Business Owner",
      duration: "6 months in community",
      avatar: "D"
    }
  ];

  const features = [
    {
      icon: Icons.Target,
      title: "Daily Accountability",
      description: "Connect with warriors who hold you to your highest standards and push you beyond your limits.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Icons.Users,
      title: "Warrior Community",
      description: "Join a tribe of high-performers committed to excellence through discipline and consistency.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Icons.BookOpen,
      title: "Strategic Resources",
      description: "Access proven frameworks, tactics, and resources used by elite performers worldwide.",
      color: "bg-purple-50 text-purple-600"
    },
    {
      icon: Icons.Sparkles,
      title: "Live Training",
      description: "Weekly sessions on performance tactics, mindset frameworks, and implementation strategies.",
      color: "bg-yellow-50 text-yellow-600"
    }
  ];

  const stats = [
    { number: "2,500+", label: "Active Warriors" },
    { number: "95%", label: "Goal Achievement Rate" },
    { number: "150+", label: "Countries Represented" },
    { number: "4.9/5", label: "Community Rating" }
  ];

  const threePillars = [
    {
      icon: Icons.Target,
      title: "Commitment",
      subtitle: "The Foundation of All Achievement",
      description: "Make the decision before you have all the answers. Commitment precedes clarity. Warriors decide first, then figure out the how.",
      details: [
        "Commit to your vision even when the path isn't clear",
        "Make decisions based on your future self, not current circumstances",
        "Honor your word to yourself above all else"
      ],
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50 dark:bg-red-900/10"
    },
    {
      icon: Icons.Clock,
      title: "Discipline",
      subtitle: "The Bridge Between Goals and Accomplishment",
      description: "Do what needs to be done regardless of how you feel. Discipline is the ability to execute on your commitments even when motivation fades.",
      details: [
        "Execute your plans regardless of emotional state",
        "Build systems that work even on your worst days",
        "Choose delayed gratification over instant satisfaction"
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/10"
    },
    {
      icon: Icons.RefreshCw,
      title: "Consistency",
      subtitle: "The Compound Effect of Excellence",
      description: "Small actions, repeated with precision over time, lead to extraordinary outcomes. Consistency compounds into unstoppable momentum.",
      details: [
        "Show up daily, especially when you don't feel like it",
        "Focus on progress, not perfection",
        "Trust the process and let time amplify your efforts"
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/10"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    setAnimateWarriors(true);
    const timer = setTimeout(() => {
      let count = 0;
      const target = 2500;
      const increment = target / 100;
      const counter = setInterval(() => {
        count += increment;
        if (count >= target) {
          setActiveWarriors(target);
          clearInterval(counter);
        } else {
          setActiveWarriors(Math.floor(count));
        }
      }, 20);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleJoinClick = (source: string) => {
    toast.success("Redirecting to join CDC Warriors!", {
      description: `Joining from: ${source}`,
    });
  };

  return (
    <div className={`min-h-screen flex flex-col transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/lovable-uploads/164358ca-4f3f-427d-8763-57b886bb4b8f.png" 
          alt="Celestial whales background"
          className="w-full h-full object-cover opacity-10 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/50 to-background/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>
      
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl shadow-sm transition-all duration-500 ease-out">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Icons.Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
              CDC Warriors
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#philosophy" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 relative group">
              Philosophy
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <Link to="/success-stories" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 relative group">
              Success Stories
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <a href="#join" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 relative group">
              Join
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-md border-primary/20">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="sm" 
                onClick={() => handleJoinClick("header")} 
                className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
              >
                <Icons.Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Join Warriors
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/login">
              <Button 
                size="sm" 
                onClick={() => handleJoinClick("header-mobile")} 
                className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-xs px-3 py-2"
              >
                Join
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="p-2 touch-target"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/98 backdrop-blur-xl">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <a 
                href="#philosophy" 
                className="block py-3 px-4 text-sm font-medium hover:text-primary hover:bg-primary/5 rounded-lg transition-colors touch-target"
                onClick={() => setMobileMenuOpen(false)}
              >
                Philosophy
              </a>
              <Link 
                to="/success-stories" 
                className="block py-3 px-4 text-sm font-medium hover:text-primary hover:bg-primary/5 rounded-lg transition-colors touch-target"
                onClick={() => setMobileMenuOpen(false)}
              >
                Success Stories
              </Link>
              <a 
                href="#join" 
                className="block py-3 px-4 text-sm font-medium hover:text-primary hover:bg-primary/5 rounded-lg transition-colors touch-target"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join
              </a>
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full mt-4 touch-target" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>
      
      <main className="flex-1 relative z-10">
        <section className="py-12 sm:py-20 md:py-32 container mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-primary/20 shadow-lg backdrop-blur-sm">
              <Icons.Target className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
              <span className="hidden xs:inline">Commitment. Discipline. Consistency.</span>
              <span className="xs:hidden">C.D.C.</span>
            </div>
            
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 max-w-5xl mx-auto leading-tight px-2">
              Join the <span className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">CDC Warriors</span> on their path to extraordinary achievement
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
              A community of high-performers who understand that greatness is not born, but forged through daily discipline and unwavering commitment.
            </p>

            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 max-w-2xl mx-auto border border-primary/10 shadow-xl backdrop-blur-sm">
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-center gap-6'} mb-4`}>
                <div className={`flex -space-x-2 sm:-space-x-3 ${isMobile ? 'justify-center mb-4' : ''}`}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-2 sm:border-4 border-background bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                      <Icons.User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className={`text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2 transition-all duration-1000 ${animateWarriors ? 'scale-110' : ''}`}>
                    {activeWarriors.toLocaleString()}+
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-semibold text-muted-foreground">
                    Active Warriors Worldwide
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1 flex-wrap">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="hidden sm:inline">Training daily • Building discipline • Achieving excellence</span>
                    <span className="sm:hidden text-center">Training daily for excellence</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
              <Link to="/login" className="w-full sm:w-auto">
                <Button 
                  size={isMobile ? "default" : "lg"}
                  onClick={() => handleJoinClick("hero")} 
                  className="w-full sm:w-auto gap-2 sm:gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-700 hover:to-blue-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 touch-target"
                >
                  <Icons.Target className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                  Start Your Journey
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "lg"}
                className="w-full sm:w-auto gap-2 sm:gap-3 hover:bg-primary/10 transition-all duration-300 hover:scale-105 border-primary/30 hover:border-primary/50 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold backdrop-blur-sm touch-target" 
                asChild
              >
                <a href="#philosophy">
                  <Icons.BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  Learn More
                </a>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group p-2 sm:p-4 rounded-lg hover:bg-primary/5 transition-colors">
                  <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2 group-hover:scale-110 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="philosophy" className="py-12 sm:py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <FeatureBadge icon={Icons.Zap} text="The CDC Philosophy" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-4 sm:mb-6 px-4">
                Three Pillars of the Warrior Mindset
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg px-4">
                Warriors understand that extraordinary results don't come from talent or luck, but from a disciplined approach to consistent action.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
              {threePillars.map((pillar, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-500 border-0 shadow-lg overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${pillar.color}`}></div>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 rounded-full ${pillar.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <pillar.icon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{pillar.title}</CardTitle>
                    <p className="text-sm font-medium text-primary">{pillar.subtitle}</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {pillar.description}
                    </p>
                    <div className="space-y-3">
                      {pillar.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-start text-left">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                          <p className="text-sm text-muted-foreground">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-16 text-center">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold mb-6">The Warrior's Journey</h3>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Badge variant="outline" className="text-sm px-4 py-2">
                    Commitment → Decision
                  </Badge>
                  <Icons.ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-sm px-4 py-2">
                    Discipline → Action
                  </Badge>
                  <Icons.ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline" className="text-sm px-4 py-2">
                    Consistency → Results
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                  Each pillar builds upon the next, creating an unbreakable foundation for success
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-24 container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <FeatureBadge icon={Icons.Sparkles} text="What You Get" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-4 sm:mb-6 px-4">
              Everything You Need to Win
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              Join thousands of warriors who have transformed their lives through our proven system and supportive community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="text-center pb-3">
                  <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section id="testimonials" className="py-12 sm:py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="order-2 md:order-1">
                <FeatureBadge icon={Icons.Users} text="The Warrior Community" />
                <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
                  Join a tribe of like-minded warriors
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Connect with others who share your commitment to excellence and hold you accountable to your highest standards.
                </p>
                
                <div className="space-y-6">
                  <FeaturePoint
                    title="Accountability Partners"
                    icon={Icons.Users}
                    text="Connect with warriors who will hold you to your word and push you beyond your limits."
                  />
                  <FeaturePoint
                    title="Daily Check-ins"
                    icon={Icons.MessageSquare}
                    text="Share your victories, challenges, and insights with the community through daily check-ins."
                  />
                  <FeaturePoint
                    title="Live Training Sessions"
                    icon={Icons.Video}
                    text="Weekly live sessions on tactics, strategies, and mental frameworks for peak performance."
                  />
                </div>
                
                <div className="mt-8">
                  <Link to="/login">
                    <Button className="gap-2 shadow-md" onClick={() => handleJoinClick("community")}>
                      <Icons.ArrowRight className="h-4 w-4" />
                      Join the Community
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <Card className="overflow-hidden border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-6">
                    <CardTitle className="text-xl">Community Highlights</CardTitle>
                    <CardDescription className="text-primary-foreground/90">
                      What our warriors are saying
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="relative h-64 overflow-hidden">
                      {testimonials.map((testimonial, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 p-6 transition-all duration-500 ${
                            index === currentTestimonial
                              ? 'translate-x-0 opacity-100'
                              : index < currentTestimonial
                              ? '-translate-x-full opacity-0'
                              : 'translate-x-full opacity-0'
                          }`}
                        >
                          <p className="italic mb-4 text-base leading-relaxed">
                            "{testimonial.quote}"
                          </p>
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <span className="font-semibold text-primary">{testimonial.avatar}</span>
                            </div>
                            <div>
                              <p className="font-medium">{testimonial.author}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                              <p className="text-xs text-muted-foreground">{testimonial.duration}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-center space-x-2 py-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors touch-target ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-6">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex -space-x-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center">
                            <Icons.User className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-white text-xs font-semibold">
                          +2.5K
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-medium">
                        Active this week
                      </Badge>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        <section id="join" className="py-12 sm:py-16 md:py-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-primary/20 shadow-lg backdrop-blur-sm">
                <Icons.Clock className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
                Join 2,500+ Warriors Today
              </div>
              
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent px-4">
                Ready to become a CDC Warrior?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                Join our community today and start your journey towards mastery through Commitment, Discipline, and Consistency.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-10 px-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <Button 
                    size={isMobile ? "default" : "lg"}
                    onClick={() => handleJoinClick("cta")} 
                    className="w-full sm:w-auto gap-2 sm:gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary via-purple-600 to-blue-600 hover:from-primary/90 hover:via-purple-700 hover:to-blue-700 hover:scale-105 touch-target"
                  >
                    <Icons.Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                    Begin Your Journey
                  </Button>
                </Link>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Free to join • No credit card required
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                  <Icons.Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Instant access</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                  <Icons.Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">24/7 community support</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                  <Icons.Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Weekly live sessions</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="relative z-10 bg-background/95 backdrop-blur-md border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                <Icons.Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">CDC Warriors</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
              <div className="flex flex-wrap justify-center gap-6">
                <a href="#philosophy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Philosophy
                </a>
                <a href="#community" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Community
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Icons.MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Icons.Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Icons.Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CDC Warriors. Empowering warriors worldwide through Commitment, Discipline, and Consistency.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
