import { render, screen, fireEvent } from '@testing-library/react';
import SearchForm from '@/components/SearchForm';

// Mock the onSearch function
const mockOnSearch = jest.fn();

describe('SearchForm', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockOnSearch.mockReset();
  });

  it('renders the search form correctly', () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    // Check if search input exists
    expect(screen.getByPlaceholderText(/Enter Censys search query/i)).toBeInTheDocument();
    
    // Check if search button exists
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  it('calls onSearch when the form is submitted', () => {
    render(<SearchForm onSearch={mockOnSearch} />);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText(/Enter Censys search query/i);
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    
    // Check if onSearch was called
    expect(mockOnSearch).toHaveBeenCalled();
  });
});
