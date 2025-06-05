import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full border border-border bg-card shadow-lg">
        <CardHeader className="text-center">
          <img src="/ctan-dnd-main.png" alt="logo" className="w-12 h-12 mx-auto mb-2" />
          <CardTitle className="text-3xl text-primary">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Log in to continue your adventure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <Input
              type="email"
              placeholder="you@tavern.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border border-border placeholder-muted-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
            <Input
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border border-border placeholder-muted-foreground"
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={!email || !password || loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Logging in..." : "Enter"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
