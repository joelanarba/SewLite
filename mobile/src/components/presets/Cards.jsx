import React from 'react';
import Card from '../Card';

export const StandardCard = React.memo(({ className = '', ...props }) => (
  <Card className={`bg-surface ${className}`} {...props} />
));

export const PrimaryCard = React.memo(({ className = '', ...props }) => (
  <Card className={`bg-primary ${className}`} {...props} />
));

export const SecondaryCard = React.memo(({ className = '', ...props }) => (
  <Card className={`bg-secondary ${className}`} {...props} />
));

export const BorderedCard = React.memo(({ className = '', ...props }) => (
  <Card className={`border-l-4 border-l-accent ${className}`} {...props} />
));

export const GhostCard = React.memo(({ className = '', ...props }) => (
  <Card className={`bg-background/50 shadow-none ${className}`} {...props} />
));
