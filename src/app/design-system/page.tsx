'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { useState } from 'react';

export default function DesignSystemPage() {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <Container size="xl" className="py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Design System Showcase</h1>
            <ThemeToggle showLabel />
          </div>
        </Container>
      </header>

      <main className="py-8">
        <Container size="xl">
          {/* Color System */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Color System</h2>
            <Grid cols={1} gap="lg" responsive={{ md: 2, lg: 3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Primary Colors</CardTitle>
                  <CardDescription>Main brand colors with light/dark variants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-primary"></div>
                      <span className="text-sm">Primary</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-accent"></div>
                      <span className="text-sm">Accent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-secondary"></div>
                      <span className="text-sm">Secondary</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Semantic Colors</CardTitle>
                  <CardDescription>Status and feedback colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-success"></div>
                      <span className="text-sm">Success</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-warning"></div>
                      <span className="text-sm">Warning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-error"></div>
                      <span className="text-sm">Error</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Neutral Colors</CardTitle>
                  <CardDescription>Background and text colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-background border"></div>
                      <span className="text-sm">Background</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-muted"></div>
                      <span className="text-sm">Muted</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded bg-card border"></div>
                      <span className="text-sm">Card</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </section>

          {/* Typography */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Typography</h2>
            <Card>
              <CardContent className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
                  <p className="text-sm text-muted-foreground">Inter font, 4xl size</p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-foreground">Heading 2</h2>
                  <p className="text-sm text-muted-foreground">Inter font, 3xl size</p>
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-foreground">Heading 3</h3>
                  <p className="text-sm text-muted-foreground">Inter font, 2xl size</p>
                </div>
                <div>
                  <p className="text-base text-foreground">Body text with Inter font family for optimal readability.</p>
                  <p className="text-sm text-muted-foreground">Inter font, base size</p>
                </div>
                <div>
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">const code = &quot;JetBrains Mono&quot;;</code>
                  <p className="text-sm text-muted-foreground">JetBrains Mono font for code</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Button Variants */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Button Components</h2>
            <Card>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Variants</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="default">Default</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="success">Success</Button>
                      <Button variant="warning">Warning</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Sizes</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">States</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button>Normal</Button>
                      <Button disabled>Disabled</Button>
                      <Button loading={loading} onClick={handleLoadingTest}>
                        {loading ? 'Loading...' : 'Test Loading'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Input Components */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Input Components</h2>
            <Grid cols={1} gap="lg" responsive={{ md: 2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Input</CardTitle>
                  <CardDescription>Standard text input with label</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Input with Validation</CardTitle>
                  <CardDescription>Input with error state and helper text</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    error={true}
                    helperText="Password must be at least 8 characters"
                  />
                </CardContent>
              </Card>
            </Grid>
          </section>

          {/* Layout Components */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Layout Components</h2>
            <Card>
              <CardHeader>
                <CardTitle>Responsive Grid System</CardTitle>
                <CardDescription>Demonstrating the responsive grid with different breakpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Mobile (1 column)</h3>
                    <Grid cols={1} gap="md" className="bg-muted p-4 rounded">
                      <div className="bg-primary text-primary-foreground p-4 rounded text-center">Item 1</div>
                      <div className="bg-primary text-primary-foreground p-4 rounded text-center">Item 2</div>
                      <div className="bg-primary text-primary-foreground p-4 rounded text-center">Item 3</div>
                    </Grid>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tablet (2 columns)</h3>
                    <Grid cols={1} gap="md" responsive={{ md: 2 }} className="bg-muted p-4 rounded">
                      <div className="bg-accent text-accent-foreground p-4 rounded text-center">Item 1</div>
                      <div className="bg-accent text-accent-foreground p-4 rounded text-center">Item 2</div>
                      <div className="bg-accent text-accent-foreground p-4 rounded text-center">Item 3</div>
                    </Grid>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Desktop (3 columns)</h3>
                    <Grid cols={1} gap="md" responsive={{ md: 2, lg: 3 }} className="bg-muted p-4 rounded">
                      <div className="bg-success text-success-foreground p-4 rounded text-center">Item 1</div>
                      <div className="bg-success text-success-foreground p-4 rounded text-center">Item 2</div>
                      <div className="bg-success text-success-foreground p-4 rounded text-center">Item 3</div>
                    </Grid>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Theme Toggle */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Theme System</h2>
            <Card>
              <CardHeader>
                <CardTitle>Dark/Light Mode Toggle</CardTitle>
                <CardDescription>Switch between light and dark themes with smooth transitions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <ThemeToggle showLabel />
                  <p className="text-sm text-muted-foreground">
                    Click the toggle to switch themes. The theme preference is saved in localStorage.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Notion-Inspired Cards */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Notion-Inspired Cards</h2>
            <Grid cols={1} gap="lg" responsive={{ md: 2, lg: 3 }}>
              <Card className="hover:shadow-notion-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Clean Design</CardTitle>
                  <CardDescription>Minimal and functional aesthetic</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Following Notion&apos;s design principles for clean, minimal interfaces that focus on content.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-notion-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Responsive Layout</CardTitle>
                  <CardDescription>Mobile-first design approach</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Built with mobile-first responsive design for optimal experience on all devices.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-notion-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                  <CardDescription>WCAG 2.1 AA compliant components</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    All components follow accessibility best practices for screen readers and keyboard navigation.
                  </p>
                </CardContent>
              </Card>
            </Grid>
          </section>
        </Container>
      </main>
    </div>
  );
}
