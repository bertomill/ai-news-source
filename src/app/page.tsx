import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { MobileNav } from '@/components/layout/mobile-nav';
import { NewsFeed } from '@/components/features/news/news-feed';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <MobileNav />

      {/* Main Content */}
      <main className="py-12">
        <Container size="xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Personalized AI News
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            One-tap access to relevant AI news during your micro-moments
          </p>
          <Button variant="default" size="lg" className="mr-4">
            Start Reading
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>

        {/* Feature Cards */}
        <Grid cols={1} gap="lg" responsive={{ md: 3 }} className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">⚡ Instant Access</CardTitle>
              <CardDescription className="text-muted-foreground">
                Get personalized AI news with just one tap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Perfect for those brief moments like waiting in line for coffee
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">🎯 Personalized</CardTitle>
              <CardDescription className="text-muted-foreground">
                AI-curated content based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn from your feedback to deliver increasingly relevant news
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">📱 Always Available</CardTitle>
              <CardDescription className="text-muted-foreground">
                Progressive Web App with offline capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Works on any device, even without internet connection
              </p>
            </CardContent>
          </Card>
        </Grid>

        {/* News Feed */}
        <div className="mb-12">
          <NewsFeed />
        </div>

        {/* Quick Start */}
        <div className="bg-card rounded-xl p-8 shadow-notion">
          <h3 className="text-2xl font-semibold text-card-foreground mb-4">
            Quick Start
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-accent-foreground">1</span>
              </div>
              <p className="text-card-foreground">
                Sign up with your email or social account
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-accent-foreground">2</span>
              </div>
              <p className="text-card-foreground">
                Set your AI news preferences and interests
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-accent-foreground">3</span>
              </div>
              <p className="text-card-foreground">
                Start receiving personalized AI news notifications
              </p>
            </div>
          </div>
        </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <Container size="xl" className="py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 AI News Tap. Built with Next.js and TypeScript.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}