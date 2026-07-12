import React from 'react';
import { render, screen } from '@testing-library/react';
import CleanCard from './CleanCard';
import { describe, it, expect } from 'vitest';

describe('CleanCard Component', () => {
  it('renders children correctly', () => {
    render(
      <CleanCard>
        <div data-testid="child-element">Test Content</div>
      </CleanCard>
    );
    
    // Check if the child element is in the document
    const childElement = screen.getByTestId('child-element');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Test Content');
  });

  it('applies custom class names', () => {
    const { container } = render(
      <CleanCard className="custom-bg-color">
        Content
      </CleanCard>
    );
    
    // The outermost div should have the default classes AND our custom class
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('custom-bg-color');
    expect(cardElement).toHaveClass('bg-white'); // One of the default classes
  });
});
