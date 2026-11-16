import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders the 32x32 canvas and palette', () => {
    render(<App />);

    expect(screen.getByRole('grid', { name: /pixel canvas/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/select color 0/i)).toBeInTheDocument();
  });

  it('clears the canvas', () => {
    render(<App />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    const pixels = screen.getAllByTestId(/pixel-/);
    for (const pixel of pixels) {
      expect(pixel).toHaveStyle({ backgroundColor: '#000000' });
    }
  });
});
