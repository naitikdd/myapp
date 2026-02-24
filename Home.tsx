import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Users, Clock, Award, BookOpen, Sparkles, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: Clock,
      title: 'Time-Bank System',
      description: 'Trade your time and expertise. 1 hour teaching = 60 Time Credits.',
    },
    {
      icon: Users,
      title: 'Peer-to-Peer Learning',
      description: 'Connect with students across departments to exchange skills.',
    },
    {
      icon: Award,
      title: 'Build Your Reputation',
      description: 'Earn ratings and feedback to showcase your teaching quality.',
    },
    {
      icon: BookOpen,
      title: 'Diverse Skills',
      description: 'From coding to cooking, learn anything from your peers.',
    },
  ];

  const categories = [
    { name: 'Coding', icon: '💻' },
    { name: 'Design', icon: '🎨' },
    { name: 'Marketing', icon: '📈' },
    { name: 'Music', icon: '🎵' },
    { name: 'Finance', icon: '💰' },
    { name: 'Language', icon: '🌍' },
    { name: 'Writing', icon: '✍️' },
    { name: 'Photography', icon: '📷' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Free Skill Exchange Platform</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Learn & Teach Skills with{' '}
              <span className="gradient-text">Time Credits</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Join the peer-to-peer skill exchange community. Trade your expertise without money.
              Knowledge is the only currency you need.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              {user ? (
                <>
                  <Button size="lg" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/search">Browse Skills</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              A simple and fair system for exchanging knowledge
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Popular Categories</h2>
            <p className="text-lg text-muted-foreground">
              Explore skills across various domains
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/search?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <Card className="border-border transition-all hover:border-primary hover:shadow-md">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <span className="mb-2 text-3xl">{category.icon}</span>
                    <span className="text-sm font-medium group-hover:text-primary">
                      {category.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="mb-2 text-4xl font-bold">100%</div>
              <div className="text-muted-foreground">Free to Use</div>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary" />
              </div>
              <div className="mb-2 text-4xl font-bold">P2P</div>
              <div className="text-muted-foreground">Direct Exchange</div>
            </div>
            <div className="text-center">
              <div className="mb-2 flex items-center justify-center">
                <Clock className="h-8 w-8 text-accent" />
              </div>
              <div className="mb-2 text-4xl font-bold">60min</div>
              <div className="text-muted-foreground">= 60 Credits</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Start Learning?
              </h2>
              <p className="mb-8 text-lg opacity-90">
                Join thousands of students exchanging skills on campus. Sign up with your
                university email today.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
}
