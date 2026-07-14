import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dropdown from './Dropdown';

describe('Dropdown', () => {
  it('renders correctly with default label', () => {
    render(<Dropdown icon="🎓" label="Form" options={['1', '2']} value="" onChange={() => {}} />);
    expect(screen.getByText('Form')).toBeInTheDocument();
  });

  it('renders correctly with value selected', () => {
    render(<Dropdown icon="🎓" label="Form" options={['1', '2']} value="1" onChange={() => {}} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('opens dropdown and displays options when clicked', async () => {
    render(<Dropdown icon="🎓" label="Form" options={['1', '2']} value="" onChange={() => {}} />);
    
    // Click the button to open
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('All Forms')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('calls onChange when an option is selected', async () => {
    const onChange = vi.fn();
    render(<Dropdown icon="🎓" label="Form" options={['1', '2']} value="" onChange={onChange} />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole('button'));
    
    // Click option
    await waitFor(() => {
      const option = screen.getByText('1');
      fireEvent.click(option);
    });
    
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('calls onChange with empty string when "All Forms" is selected', async () => {
    const onChange = vi.fn();
    render(<Dropdown icon="🎓" label="Form" options={['1', '2']} value="1" onChange={onChange} />);
    
    // Open dropdown
    fireEvent.click(screen.getByRole('button'));
    
    // Click All Forms
    await waitFor(() => {
      const allOption = screen.getByText('All Forms');
      fireEvent.click(allOption);
    });
    
    expect(onChange).toHaveBeenCalledWith('');
  });
});
