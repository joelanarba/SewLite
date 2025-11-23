import React from 'react';
import Card from '../Card';

export const StandardCard = ({ className = '', ...props }) => (
  <Card className={`bg-surface ${className}`} {...props} />
);

export const PrimaryCard = ({ className = '', ...props }) => (
  <Card className={`bg-primary ${className}`} {...props} />
);

export const SecondaryCard = ({ className = '', ...props }) => (
  <Card className={`bg-secondary ${className}`} {...props} />
);

export const BorderedCard = ({ className = '', ...props }) => (
  <Card className={`border-l-4 border-l-accent ${className}`} {...props} />
);

export const GhostCard = ({ className = '', ...props }) => (
  <Card className={`bg-background/50 shadow-none ${className}`} {...props} />
);
