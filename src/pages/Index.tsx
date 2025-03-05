
import React from "react";
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
  BookOpen
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar transparent />
      
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2">
              Built for entrepreneurs
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance max-w-3xl">
              Connect, Organize, and 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 ml-2">Thrive</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mt-2 mb-6">
              The all-in-one workspace for entrepreneurs to chat, collaborate, and organize their workflow like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-sm group">
                  Get Started 
                  <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50 relative overflow-hidden" id="features">
        <div className="container px-4 md:px-6 relative">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Everything You Need in One Place</h2>
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
      
      <section className="py-20" id="why-us">
        <div className="container px-4 md:px-6">
          <div className="bento-grid">
            <div className="bento-card-large glass-morphism flex flex-col justify-center p-8 animate-slide-in">
              <h3 className="text-2xl font-bold mb-4">Start Your Day Right</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our morning strategy feature helps you plan your day effectively, focus on what matters, and build positive habits that stick.
              </p>
              <div className="flex space-x-4">
                <FeatureBadge icon={Clock} text="Morning Routine" />
                <FeatureBadge icon={CheckCircle} text="Daily Habits" />
                <FeatureBadge icon={Zap} text="Focus Sessions" />
              </div>
            </div>
            
            <div className="bento-card glass-morphism animate-slide-right">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                <BookOpen className="text-primary h-12 w-12" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Journal Reflections</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Daily prompts help you reflect, learn, and grow from your experiences.
              </p>
            </div>
            
            <div className="bento-card glass-morphism animate-slide-right animation-delay-200">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                <BarChart className="text-primary h-12 w-12" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Habit Analytics</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Visual insights into your habit streaks and productivity patterns.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50" id="about">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 animate-slide-in">
              <div className="glass-morphism p-8 relative overflow-hidden rounded-2xl">
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
                    <span className="text-primary font-medium">Learn about our story</span>
                    <ArrowRight size={16} className="ml-2 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 animate-slide-right">
              <h2 className="text-3xl font-bold mb-6">Built by Entrepreneurs, <br/>For Entrepreneurs</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                We've combined the best parts of community platforms with productivity tools to create a seamless experience that helps you focus on what matters - growing your business.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1 mr-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Intuitive design that helps you stay focused</p>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1 mr-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Seamless integration between chat and workspace</p>
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-1 mr-3">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">Designed to help you save time and stay organized</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-primary/5 dark:bg-primary/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8 text-balance">
              Join thousands of entrepreneurs already using Nexus to connect and organize their journey.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow group">
                Start Now <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
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
            <div className="flex space-x-6">
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">Terms</Link>
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">Privacy</Link>
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">Contact</Link>
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
      className="bento-card animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
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
    <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-1 text-sm">
      <Icon size={14} className="mr-1 text-primary" />
      <span>{text}</span>
    </div>
  );
};

export default Index;
