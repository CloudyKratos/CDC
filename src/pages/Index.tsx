import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/home/FeatureCard";
import { FeaturePoint } from "@/components/home/FeaturePoint";
import { FeatureBadge } from "@/components/home/FeatureBadge";
import Icons from "@/utils/IconUtils";
import { toast } from 'sonner';

const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeWarriors, setActiveWarriors] = useState(0);
  const [animateWarriors, setAnimateWarriors] = useState(false);

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

  // Enhanced Three Pillars with detailed content
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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Loading animation
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Animate active warriors counter
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
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/lovable-uploads/164358ca-4f3f-427d-8763-57b886bb4b8f.png" 
          alt="Celestial whales background"
          className="w-full h-full object-cover opacity-10 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/50 to-background/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>
      
      {/* Enhanced Header */}
      <header className="relative z-10 border-b bg-background/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icons.Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              CDC Warriors
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#philosophy" className="text-sm font-medium hover:text-primary transition-colors">Philosophy</a>
            <a href="#community" className="text-sm font-medium hover:text-primary transition-colors">Community</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Success Stories</a>
            <a href="#join" className="text-sm font-medium hover:text-primary transition-colors">Join</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link to="/community">
              <Button variant="outline" size="sm" className="hover:bg-primary/5">
                💬 Community
              </Button>
            </Link>
            <Link to="/simple-login">
              <Button variant="outline" size="sm" className="hidden md:flex hover:bg-primary/5">
                Sign In
              </Button>
            </Link>
            <Link to="/simple-login">
              <Button size="sm" onClick={() => handleJoinClick("header")} className="shadow-md hover:shadow-lg transition-shadow">
                <Icons.Sparkles className="h-4 w-4 mr-2" />
                Join Warriors
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative z-10">
        {/* Enhanced Hero Section with Active Warriors Counter */}
        <section className="py-20 md:py-32 container mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Icons.Target className="h-4 w-4" />
              Commitment. Discipline. Consistency.
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl mx-auto">
              Join the <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">CDC Warriors</span> on their path to extraordinary achievement
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              A community of high-performers who understand that greatness is not born, but forged through daily discipline and unwavering commitment.
            </p>

            {/* Enhanced Active Warriors Counter */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 mb-10 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                      <Icons.User className="h-6 w-6 text-white" />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <div className={`text-4xl md:text-5xl font-bold text-primary mb-2 transition-all duration-1000 ${animateWarriors ? 'scale-110' : ''}`}>
                    {activeWarriors.toLocaleString()}+
                  </div>
                  <div className="text-lg font-semibold text-muted-foreground">
                    Active Warriors Worldwide
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Training daily • Building discipline • Achieving excellence
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button size="lg" onClick={() => handleJoinClick("hero")} className="gap-2 shadow-lg hover:shadow-xl transition-all group">
                  <Icons.Target className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Your Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2 hover:bg-primary/5" asChild>
                <a href="#philosophy">
                  <Icons.BookOpen className="h-5 w-5" />
                  Learn More
                </a>
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enhanced Three Pillars Section */}
        <section id="philosophy" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <FeatureBadge icon={Icons.Zap} text="The CDC Philosophy" />
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
                Three Pillars of the Warrior Mindset
              </h2>
              <p className="text-muted-foreground text-lg">
                Warriors understand that extraordinary results don't come from talent or luck, but from a disciplined approach to consistent action.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 mt-12">
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

            {/* Pillar Connection Visualization */}
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

        {/* New Features Section */}
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="text-center mb-16">
            <FeatureBadge icon={Icons.Sparkles} text="What You Get" />
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
              Everything You Need to Win
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join thousands of warriors who have transformed their lives through our proven system and supportive community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        
        {/* Enhanced Community Section */}
        <section id="community" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
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
                    {/* Rotating Testimonials */}
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
                    
                    {/* Testimonial Indicators */}
                    <div className="flex justify-center space-x-2 py-4">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTestimonial(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
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
        
        {/* Enhanced CTA Section */}
        <section id="join" className="py-16 md:py-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Icons.Clock className="h-4 w-4" />
                Join 2,500+ Warriors Today
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to become a CDC Warrior?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Join our community today and start your journey towards mastery through Commitment, Discipline, and Consistency.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link to="/login">
                  <Button size="lg" onClick={() => handleJoinClick("cta")} className="gap-2 shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg">
                    <Icons.Sparkles className="h-6 w-6" />
                    Begin Your Journey
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  Free to join • No credit card required
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icons.Check className="h-4 w-4 text-green-600" />
                  <span>Instant access</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icons.Check className="h-4 w-4 text-green-600" />
                  <span>24/7 community support</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icons.Check className="h-4 w-4 text-green-600" />
                  <span>Weekly live sessions</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Enhanced Footer */}
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
