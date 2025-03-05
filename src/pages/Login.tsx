
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn, UserPlus, Github, Twitter, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("user", JSON.stringify({ email: loginEmail, name: "Demo User" }));
      toast({
        title: "Login successful",
        description: "Welcome back to Nexus!",
      });
      navigate("/dashboard");
    }, 1500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("user", JSON.stringify({ email: signupEmail, name: signupName }));
      toast({
        title: "Account created",
        description: "Welcome to Nexus! Your journey begins now.",
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 doodle-pattern p-4">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <Logo size="sm" />
        <h1 className="text-lg font-bold gradient-text">Nexus</h1>
      </div>
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-primary/5 to-transparent dark:from-primary/10 pointer-events-none" />
      
      <div className="max-w-md w-full">
        <h1 className="text-center text-3xl font-bold mb-2 animate-fade-in gradient-text">Welcome to Nexus</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 animate-fade-in">
          The platform for entrepreneurs seeking growth
        </p>
        
        <Card className="border-gray-200 dark:border-gray-800 shadow-xl animate-scale-in overflow-hidden glass-morphism">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="glass-morphism border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="glass-morphism border-gray-200 dark:border-gray-700"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full group" disabled={loading}>
                    {loading ? "Logging in..." : "Login to Account"}
                    {!loading && <LogIn className="ml-2 transition-transform group-hover:translate-x-1" size={16} />}
                  </Button>
                  <div className="relative w-full text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative px-2 inline-block text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-card">
                      Or continue with
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" type="button" className="w-full glass-morphism">
                      <Github size={16} className="mr-2" />
                      GitHub
                    </Button>
                    <Button variant="outline" type="button" className="w-full glass-morphism">
                      <Twitter size={16} className="mr-2" />
                      Twitter
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>Join our community of entrepreneurs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="glass-morphism border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="glass-morphism border-gray-200 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="signup-password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="glass-morphism border-gray-200 dark:border-gray-700"
                      />
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full group" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                    {!loading && <UserPlus className="ml-2 transition-transform group-hover:translate-x-1" size={16} />}
                  </Button>
                  <div className="relative w-full text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative px-2 inline-block text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-card">
                      Or continue with
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" type="button" className="w-full glass-morphism">
                      <Github size={16} className="mr-2" />
                      GitHub
                    </Button>
                    <Button variant="outline" type="button" className="w-full glass-morphism">
                      <Twitter size={16} className="mr-2" />
                      Twitter
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-primary hover:underline flex items-center justify-center group">
            Back to homepage
            <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
