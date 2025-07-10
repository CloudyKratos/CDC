
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import Icons from "@/utils/IconUtils";
import { toast } from 'sonner';

const CommunityLanding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    goals: '',
    experience: '',
    commitment: false,
    newsletter: true
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleJoinCommunity = () => {
    toast.success("Welcome to CDC Warriors! 🎉", {
      description: "Your journey to greatness begins now.",
    });
    // Here you would typically integrate with your community platform
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  const testimonials = [
    {
      quote: "The CDC Warriors community transformed my approach to discipline. I've achieved more in 6 months than in the previous 2 years.",
      author: "Sarah Chen",
      role: "Entrepreneur",
      image: "S",
      result: "10x productivity increase"
    },
    {
      quote: "Having warriors who hold me accountable daily has been game-changing. The support here is unmatched.",
      author: "Marcus Rodriguez",
      role: "Fitness Coach",
      image: "M",
      result: "Launched 3 successful programs"
    },
    {
      quote: "From procrastination to peak performance - this community showed me what consistency really means.",
      author: "Emma Thompson",
      role: "Software Developer",
      image: "E",
      result: "Promoted to Senior Engineer"
    }
  ];

  const benefits = [
    {
      icon: Icons.Users,
      title: "Elite Community",
      description: "Connect with 2,500+ high-performers worldwide who share your commitment to excellence.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Icons.Target,
      title: "Daily Accountability",
      description: "Get paired with accountability partners who will push you beyond your limits.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Icons.Sparkles,
      title: "Proven System",
      description: "Access our battle-tested CDC methodology that has transformed thousands of lives.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Icons.BookOpen,
      title: "Exclusive Resources",
      description: "Get access to premium training materials, workshops, and success frameworks.",
      color: "from-orange-500 to-red-500"
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.User className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome, Future Warrior!</h2>
              <p className="text-muted-foreground">Let's start your transformation journey</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What Are Your Goals?</h2>
              <p className="text-muted-foreground">Tell us what you want to achieve</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Primary Goals</label>
                <Textarea
                  placeholder="Describe your main goals and what you want to accomplish..."
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  className="min-h-[120px] transition-all duration-200 focus:scale-[1.02]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Current Experience Level</label>
                <select
                  className="w-full p-3 border rounded-md transition-all duration-200 focus:scale-[1.02] focus:ring-2 focus:ring-primary/20"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                >
                  <option value="">Select your level</option>
                  <option value="beginner">Beginner - Just starting out</option>
                  <option value="intermediate">Intermediate - Some experience</option>
                  <option value="advanced">Advanced - Experienced performer</option>
                  <option value="expert">Expert - High achiever looking to optimize</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">The Warrior's Commitment</h2>
              <p className="text-muted-foreground">Excellence requires dedication</p>
            </div>
            
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">The CDC Warrior Pledge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-primary/5 to-purple-600/5 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed italic">
                    "I commit to showing up daily, embracing discipline over motivation, 
                    and supporting my fellow warriors on this journey to excellence. 
                    I understand that greatness is forged through consistency, not comfort."
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="commitment"
                    checked={formData.commitment}
                    onCheckedChange={(checked) => handleInputChange('commitment', checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="commitment" className="text-sm leading-relaxed">
                    I understand and accept the commitment required to be a CDC Warrior. 
                    I am ready to transform my life through consistent daily action.
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => handleInputChange('newsletter', checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="newsletter" className="text-sm leading-relaxed">
                    I want to receive exclusive warrior insights, success stories, and community updates.
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Icons.Check className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to the Warriors!</h2>
              <p className="text-muted-foreground mb-6">Your transformation journey begins now</p>
              
              <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-6 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-4">What happens next:</h3>
                <div className="space-y-3 text-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <span>You'll be redirected to create your warrior account</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <span>Get matched with your accountability partners</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <span>Join your first daily check-in session</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">4</span>
                    </div>
                    <span>Begin your 30-day warrior transformation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <Icons.Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">CDC Warriors</span>
          </Link>
          
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Icons.ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Step {currentStep} of 4</span>
              <span className="text-sm text-muted-foreground">Join the Warriors</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Form */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                {renderStep()}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <Icons.ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  
                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNext}
                      disabled={
                        (currentStep === 1 && (!formData.fullName || !formData.email)) ||
                        (currentStep === 2 && (!formData.goals || !formData.experience)) ||
                        (currentStep === 3 && !formData.commitment)
                      }
                      className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600"
                    >
                      Next
                      <Icons.ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinCommunity}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 transition-all duration-200"
                    >
                      <Icons.Sparkles className="h-4 w-4" />
                      Join Warriors
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Benefits Sidebar */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.Users className="h-5 w-5 text-primary" />
                    Why Join CDC Warriors?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center`}>
                        <benefit.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{benefit.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Testimonials */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icons.MessageSquare className="h-5 w-5 text-primary" />
                    Warrior Success Stories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="border-l-4 border-primary/20 pl-4">
                      <p className="text-sm italic mb-2">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{testimonial.image}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{testimonial.author}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs mt-2">
                        {testimonial.result}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLanding;
