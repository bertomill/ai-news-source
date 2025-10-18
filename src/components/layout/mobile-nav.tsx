'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/layout/container';
import { Menu, X, Home, Settings, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`bg-card border-b border-border ${className}`}>
      <Container size="xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-foreground">News Tap</span>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/news" className="text-foreground hover:text-primary transition-colors">
              News
            </Link>
            <Link href="/settings" className="text-foreground hover:text-primary transition-colors">
              Settings
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 space-y-2">
              <Link
                href="/"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link
                href="/news"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <BookOpen className="h-5 w-5" />
                <span>News</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </nav>
  );
}
