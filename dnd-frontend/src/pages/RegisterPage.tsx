import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full border border-border bg-card shadow-lg">
        <CardHeader className="text-center">
          <img src="/ctan-dnd-main.png" alt="logo" className="w-12 h-12 mx-auto mb-2" />
          <CardTitle className="text-3xl text-primary">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">
            Begin your journey with us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
            <Input
              type="text"
              placeholder="hero123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-card border border-border placeholder-muted-foreground"
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Confirm Password</label>
            <Input
              type="password"
              placeholder="******"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-card border border-border placeholder-muted-foreground"
            />
          </div>
          <Button
            onClick={handleRegister}
            disabled={!username || !email || !password || password !== confirm || loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Registering..." : "Register"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
