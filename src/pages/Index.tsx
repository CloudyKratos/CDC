
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FeatureCard } from "@/components/home/FeatureCard";
import { FeaturePoint } from "@/components/home/FeaturePoint";
import { FeatureBadge } from "@/components/home/FeatureBadge";
import Icons from "@/utils/IconUtils";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/lovable-uploads/164358ca-4f3f-427d-8763-57b886bb4b8f.png" 
          alt="Celestial whales background"
          className="w-full h-full object-cover opacity-15 dark:opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/90"></div>
      </div>
      
      <header className="relative z-10 border-b bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icons.Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold">CDC Warriors</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors">CDC Philosophy</Link>
            <Link to="#community" className="text-sm font-medium hover:text-primary transition-colors">Community</Link>
            <Link to="#about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          </nav>
          
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden md:flex">
                Login
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">
                Join Warriors
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="py-20 md:py-32 container mx-auto px-4 text-center relative">
          <FeatureBadge text="Commitment. Discipline. Consistency." />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mt-4 mb-6 max-w-4xl mx-auto">
            Join the <span className="text-primary">CDC Warriors</span> on their path to extraordinary achievement
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A community of high-performers who understand that greatness is not born, but forged through daily discipline and unwavering commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                <Icons.Target className="h-5 w-5" />
                Start Your Journey
              </Button>
            </Link>
            <Link to="#learn-more">
              <Button variant="outline" size="lg" className="gap-2">
                <Icons.BookOpen className="h-5 w-5" />
                Learn More
              </Button>
            </Link>
          </div>
        </section>
        
        {/* CDC Philosophy Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <FeatureBadge text="The CDC Philosophy" />
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
                Three Pillars of the Warrior Mindset
              </h2>
              <p className="text-muted-foreground">
                Warriors understand that extraordinary results don't come from talent or luck, but from a disciplined approach to consistent action.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <FeatureCard
                icon={<Icons.Target className="h-10 w-10" />}
                title="Commitment"
                description="Make the decision before you have all the answers. Commitment precedes clarity. Warriors decide first, then figure out the how."
              />
              <FeatureCard
                icon={<Icons.Clock className="h-10 w-10" />}
                title="Discipline"
                description="Do what needs to be done regardless of how you feel. Discipline is the ability to execute on your commitments even when motivation fades."
              />
              <FeatureCard
                icon={<Icons.RefreshCw className="h-10 w-10" />}
                title="Consistency"
                description="Small actions, repeated with precision over time, lead to extraordinary outcomes. Consistency compounds into unstoppable momentum."
              />
            </div>
          </div>
        </section>
        
        {/* Community Section */}
        <section id="community" className="py-16 md:py-24 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <FeatureBadge text="The Warrior Community" />
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
                Join a tribe of like-minded warriors
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Connect with others who share your commitment to excellence and hold you accountable to your highest standards.
              </p>
              
              <div className="space-y-6">
                <FeaturePoint
                  icon={<Icons.Users className="h-5 w-5" />}
                  title="Accountability Partners"
                  description="Connect with warriors who will hold you to your word and push you beyond your limits."
                />
                <FeaturePoint
                  icon={<Icons.MessageSquare className="h-5 w-5" />}
                  title="Daily Check-ins"
                  description="Share your victories, challenges, and insights with the community through daily check-ins."
                />
                <FeaturePoint
                  icon={<Icons.Video className="h-5 w-5" />}
                  title="Live Training Sessions"
                  description="Weekly live sessions on tactics, strategies, and mental frameworks for peak performance."
                />
              </div>
              
              <div className="mt-8">
                <Link to="/login">
                  <Button className="gap-2">
                    <Icons.ArrowRight className="h-4 w-4" />
                    Join the Community
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-primary text-primary-foreground py-6">
                  <CardTitle>Community Highlights</CardTitle>
                  <CardDescription className="text-primary-foreground/90">
                    What our warriors are saying
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <div className="p-6">
                      <p className="italic mb-4">
                        "The CDC philosophy changed everything for me. I stopped waiting for motivation and started showing up every day, no matter what."
                      </p>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Icons.User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Michael K.</p>
                          <p className="text-sm text-muted-foreground">Entrepreneur, 8 months in community</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="italic mb-4">
                        "The daily accountability has been game-changing. Knowing other warriors are expecting me to show up pushes me through the resistance."
                      </p>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Icons.User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Sarah T.</p>
                          <p className="text-sm text-muted-foreground">Fitness coach, 1 year in community</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted p-6">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center">
                          <Icons.User className="h-4 w-4 text-primary" />
                        </div>
                      ))}
                      <div className="h-8 w-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-white text-xs">
                        +248
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Active warriors this week</p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="learn-more" className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to become a CDC Warrior?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join our community today and start your journey towards mastery through Commitment, Discipline, and Consistency.
              </p>
              <Link to="/login">
                <Button size="lg" className="gap-2">
                  <Icons.Sparkles className="h-5 w-5" />
                  Begin Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="relative z-10 bg-background/90 backdrop-blur-sm border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icons.Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold">CDC Warriors</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center">
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms & Conditions
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <div className="flex items-center gap-2">
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
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CDC Warriors. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
