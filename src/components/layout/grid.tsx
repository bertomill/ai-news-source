import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive, ...props }, ref) => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    };

    const responsiveClasses = responsive
      ? Object.entries(responsive)
          .map(([breakpoint, cols]) => {
            const breakpointClasses = {
              sm: 'sm:',
              md: 'md:',
              lg: 'lg:',
              xl: 'xl:',
            };
            return `${breakpointClasses[breakpoint as keyof typeof breakpointClasses]}${colClasses[cols]}`;
          })
          .join(' ')
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colClasses[cols],
          gapClasses[gap],
          responsiveClasses,
          className
        )}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  start?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  end?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  responsive?: {
    sm?: { span?: 1 | 2 | 3 | 4 | 5 | 6 | 12; start?: 1 | 2 | 3 | 4 | 5 | 6 | 12; end?: 1 | 2 | 3 | 4 | 5 | 6 | 12 };
    md?: { span?: 1 | 2 | 3 | 4 | 5 | 6 | 12; start?: 1 | 2 | 3 | 4 | 5 | 6 | 12; end?: 1 | 2 | 3 | 4 | 5 | 6 | 12 };
    lg?: { span?: 1 | 2 | 3 | 4 | 5 | 6 | 12; start?: 1 | 2 | 3 | 4 | 5 | 6 | 12; end?: 1 | 2 | 3 | 4 | 5 | 6 | 12 };
    xl?: { span?: 1 | 2 | 3 | 4 | 5 | 6 | 12; start?: 1 | 2 | 3 | 4 | 5 | 6 | 12; end?: 1 | 2 | 3 | 4 | 5 | 6 | 12 };
  };
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, span, start, end, responsive, ...props }, ref) => {
    const spanClasses = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      12: 'col-span-12',
    };

    const startClasses = {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
      12: 'col-start-12',
    };

    const endClasses = {
      1: 'col-end-1',
      2: 'col-end-2',
      3: 'col-end-3',
      4: 'col-end-4',
      5: 'col-end-5',
      6: 'col-end-6',
      12: 'col-end-12',
    };

    const responsiveClasses = responsive
      ? Object.entries(responsive)
          .map(([breakpoint, config]) => {
            const breakpointClasses = {
              sm: 'sm:',
              md: 'md:',
              lg: 'lg:',
              xl: 'xl:',
            };
            const prefix = breakpointClasses[breakpoint as keyof typeof breakpointClasses];
            return [
              config.span ? `${prefix}${spanClasses[config.span]}` : '',
              config.start ? `${prefix}${startClasses[config.start]}` : '',
              config.end ? `${prefix}${endClasses[config.end]}` : '',
            ]
              .filter(Boolean)
              .join(' ');
          })
          .join(' ')
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          span && spanClasses[span],
          start && startClasses[start],
          end && endClasses[end],
          responsiveClasses,
          className
        )}
        {...props}
      />
    );
  }
);
GridItem.displayName = 'GridItem';

export { Grid, GridItem };
