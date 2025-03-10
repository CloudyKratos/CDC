
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const WaitlistForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    company: "",
    role: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real implementation, this would send data to a server
    // For now, we'll simulate a successful submission
    setTimeout(() => {
      toast.success("Application submitted successfully!", {
        description: "We'll review your application and get back to you soon."
      });
      setFormData({
        name: "",
        email: "",
        reason: "",
        company: "",
        role: ""
      });
      setIsSubmitting(false);
      
      // In a real implementation, we would store this in localStorage or a database
      const waitlistRequests = JSON.parse(localStorage.getItem('waitlistRequests') || '[]');
      waitlistRequests.push({
        ...formData,
        id: `request-${Date.now()}`,
        status: 'pending',
        date: new Date().toISOString()
      });
      localStorage.setItem('waitlistRequests', JSON.stringify(waitlistRequests));
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border border-gray-800 bg-black/60 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Join Our Beta Program
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Apply to be part of our exclusive beta testing group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                className="bg-gray-900/60 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className="bg-gray-900/60 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company/Organization</Label>
              <Input 
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company or organization"
                className="bg-gray-900/60 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Your job title or role"
                className="bg-gray-900/60 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Why do you want to join our beta?</Label>
              <Textarea 
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Tell us why you're interested in our beta program"
                required
                className="bg-gray-900/60 border-gray-700 text-white min-h-[100px]"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Submitting...</span>
                </div>
              ) : "Apply for Beta Access"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-gray-500">
          <p>
            Already have an invite? <a href="/login" className="text-blue-400 hover:underline">Sign in here</a>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default WaitlistForm;
