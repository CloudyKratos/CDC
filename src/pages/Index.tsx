
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  FileText, 
  CalendarDays, 
  Users, 
  ArrowRight, 
  LucideIcon, 
  Sparkles,
  Zap,
  Clock,
  BarChart,
  CheckCircle,
  BookOpen,
  MousePointerClick,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  // Animation on scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        if (isVisible) {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'translateY(0)';
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on load
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showFeatureMessage = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature will be available in the next update.",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-primary/10 pointer-events-none z-0"></div>
      
      <Navbar transparent />
      
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/50 to-purple-500/5 pointer-events-none"></div>
        <div className="absolute -top-[30%] -right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[30%] -left-[10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
        
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="inline-block rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 px-4 py-1.5 text-sm font-medium text-primary mb-2 backdrop-blur-sm border border-primary/10">
              Built for entrepreneurs
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance max-w-3xl leading-tight">
              Connect, Organize, and 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 ml-2">Thrive</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mt-2 mb-6">
              The all-in-one workspace for entrepreneurs to chat, collaborate, and organize their workflow like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-md group relative overflow-hidden">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-purple-500/80 group-hover:opacity-90 transition-opacity"></span>
                  <span className="relative">Get Started</span>
                  <ArrowRight className="ml-2 relative transition-transform group-hover:translate-x-1" size={16} />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/50 backdrop-blur-sm"
                onClick={showFeatureMessage}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gradient-to-br from-gray-50/50 via-background to-gray-50/50 dark:from-gray-900/50 dark:via-background dark:to-gray-900/50 relative overflow-hidden" id="features">
        <div className="absolute -top-[10%] right-[10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="text-center mb-12 animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)'}}>
            <div className="inline-block rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
              Powerful Features
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">Everything You Need in One Place</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful tools designed to help entrepreneurs connect and stay organized
            </p>
          </div>
          
          <div className="bento-grid">
            <FeatureCard 
              icon={MessageSquare} 
              title="Real-time Chat"
              description="Connect with other entrepreneurs through intuitive messaging"
              delay={0}
            />
            <FeatureCard 
              icon={FileText} 
              title="Workspace Notes"
              description="Create and organize documents, ideas, and plans"
              delay={100}
            />
            <FeatureCard 
              icon={CalendarDays} 
              title="Smart Calendar"
              description="Schedule and manage your events and deadlines"
              delay={200}
            />
            <FeatureCard 
              icon={Users} 
              title="Community"
              description="Build meaningful connections with fellow entrepreneurs"
              delay={300}
            />
            <FeatureCard 
              icon={Sparkles} 
              title="AI-Powered Insights"
              description="Get personalized recommendations for your business growth"
              delay={400}
            />
            <FeatureCard 
              icon={BarChart} 
              title="Analytics Dashboard"
              description="Track your progress and identify opportunities"
              delay={500}
            />
          </div>
        </div>
      </section>
      
      <section className="py-20 relative" id="why-us">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-gray-50/30 to-primary/5 dark:from-background dark:via-gray-900/30 dark:to-primary/10 pointer-events-none"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="animate-on-scroll opacity-0 transition-all duration-700 mb-12 text-center" style={{transform: 'translateY(20px)'}}>
            <div className="inline-block rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
              Why Choose Us
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300">
              Designed to Enhance Your Productivity
            </h2>
          </div>
          
          <div className="bento-grid">
            <div className="bento-card-large glass-morphism flex flex-col justify-center p-8 animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)'}}>
              <h3 className="text-2xl font-bold mb-4">Start Your Day Right</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our morning strategy feature helps you plan your day effectively, focus on what matters, and build positive habits that stick.
              </p>
              <div className="flex flex-wrap gap-3">
                <FeatureBadge icon={Clock} text="Morning Routine" />
                <FeatureBadge icon={CheckCircle} text="Daily Habits" />
                <FeatureBadge icon={Zap} text="Focus Sessions" />
              </div>
            </div>
            
            <div className="bento-card glass-morphism animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)'}}>
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg mb-4 overflow-hidden flex items-center justify-center group">
                <BookOpen className="text-primary h-12 w-12 transition-transform group-hover:scale-110" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Journal Reflections</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Daily prompts help you reflect, learn, and grow from your experiences.
              </p>
            </div>
            
            <div className="bento-card glass-morphism animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)', transitionDelay: '200ms'}}>
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg mb-4 overflow-hidden flex items-center justify-center group">
                <BarChart className="text-primary h-12 w-12 transition-transform group-hover:scale-110" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Habit Analytics</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Visual insights into your habit streaks and productivity patterns.
              </p>
            </div>
            
            <div className="bento-card glass-morphism animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)', transitionDelay: '300ms'}}>
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg mb-4 overflow-hidden flex items-center justify-center group">
                <ShieldCheck className="text-primary h-12 w-12 transition-transform group-hover:scale-110" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Secure Workspace</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Your data is encrypted and protected with enterprise-grade security.
              </p>
            </div>
            
            <div className="bento-card glass-morphism animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)', transitionDelay: '400ms'}}>
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg mb-4 overflow-hidden flex items-center justify-center group">
                <MousePointerClick className="text-primary h-12 w-12 transition-transform group-hover:scale-110" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Intuitive Interface</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Simple, clean design that focuses on what matters most to you.
              </p>
            </div>
            
            <div className="bento-card glass-morphism animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)', transitionDelay: '500ms'}}>
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg mb-4 overflow-hidden flex items-center justify-center group">
                <Cpu className="text-primary h-12 w-12 transition-transform group-hover:scale-110" />
              </div>
              <h4 className="text-lg font-semibold mb-2">AI Integration</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Smart features that learn your preferences and help you work better.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gradient-to-br from-background via-gray-50/30 to-background dark:from-background dark:via-gray-900/30 dark:to-background" id="about">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)'}}>
              <div className="glass-morphism p-8 relative overflow-hidden rounded-2xl border border-gray-100/20 dark:border-gray-800/20 backdrop-blur-sm">
                <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -top-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <Logo className="mr-2" />
                    <h3 className="text-xl font-bold gradient-text">Nexus</h3>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Why Nexus?</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    We understand the unique challenges entrepreneurs face. That's why we built Nexus - to combine the power of community with efficient workflow tools in one beautiful, intuitive platform.
                  </p>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      className="text-primary font-medium p-0 hover:bg-transparent hover:text-primary/80"
                      onClick={showFeatureMessage}
                    >
                      <span>Learn about our story</span>
                      <ArrowRight size={16} className="ml-2 text-primary" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)', transitionDelay: '200ms'}}>
              <h2 className="text-3xl font-bold mb-6">Built by Entrepreneurs, <br/>For Entrepreneurs</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                We've combined the best parts of community platforms with productivity tools to create a seamless experience that helps you focus on what matters - growing your business.
              </p>
              <div className="space-y-4">
                <FeaturePoint text="Intuitive design that helps you stay focused" />
                <FeaturePoint text="Seamless integration between chat and workspace" />
                <FeaturePoint text="Designed to help you save time and stay organized" />
                <FeaturePoint text="AI-powered insights to help you make better decisions" />
                <FeaturePoint text="Community features that foster genuine connections" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 dark:from-primary/10 dark:via-background dark:to-purple-500/10 relative">
        <div className="absolute -top-[30%] -right-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center text-center animate-on-scroll opacity-0 transition-all duration-700" style={{transform: 'translateY(20px)'}}>
            <div className="inline-block rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 px-3 py-1 text-sm font-medium text-primary mb-4 backdrop-blur-sm">
              Join Us Today
            </div>
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8 text-balance">
              Join thousands of entrepreneurs already using Nexus to connect and organize their journey.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-md group relative overflow-hidden">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary to-purple-500/80 group-hover:opacity-90 transition-opacity"></span>
                <span className="relative">Start Now</span>
                <ArrowRight className="ml-2 relative transition-transform group-hover:translate-x-1" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="py-12 border-t border-gray-100/20 dark:border-gray-800/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <Logo className="mr-2" />
                <h3 className="text-lg font-bold gradient-text">Nexus</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                © {new Date().getFullYear()} Nexus. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6 items-center">
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">Terms</Link>
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">Privacy</Link>
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">Contact</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, delay }) => {
  return (
    <div 
      className="bento-card animate-on-scroll opacity-0 transition-all duration-700 hover:shadow-lg hover:-translate-y-1 hover:bg-white/70 dark:hover:bg-gray-800/70"
      style={{ transform: 'translateY(20px)', transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

interface FeatureBadgeProps {
  icon: LucideIcon;
  text: string;
}

const FeatureBadge: React.FC<FeatureBadgeProps> = ({ icon: Icon, text }) => {
  return (
    <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-1.5 text-sm border border-gray-100/20 dark:border-gray-700/20 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <Icon size={14} className="mr-1.5 text-primary" />
      <span>{text}</span>
    </div>
  );
};

const FeaturePoint: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex items-start">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center mt-1 mr-3 shadow-sm">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  );
};

export default Index;
