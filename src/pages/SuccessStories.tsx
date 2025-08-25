import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Clock, User } from 'lucide-react';

const SuccessStories = () => {
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
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real warriors, real transformations. Watch how our community members turned consistency into life-changing results.
            </p>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTestimonials.map((video) => (
            <Card key={video.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="relative">
                <img 
                  src={video.thumbnail}
                  alt={`${video.author} testimonial`}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                
                {/* Play Button Overlay */}
                <button
                  onClick={() => handleVideoPlay(video.id, video.title)}
                  className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                >
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                  </div>
                </button>

                {/* Duration Badge */}
                <Badge variant="secondary" className="absolute top-3 right-3 gap-1">
                  <Clock className="h-3 w-3" />
                  {video.duration}
                </Badge>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{video.author} • {video.role}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {video.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 py-12 px-6 bg-muted/30 rounded-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of warriors who have transformed their lives through the power of consistency. Your breakthrough is just one decision away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="gap-2">
                <User className="h-4 w-4" />
                Join the Warriors
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;