import { render, screen } from '@testing-library/react';
import CredentialsWarning from '@/components/CredentialsWarning';
import { censysConfig } from '@/config/env';

// Mock the config module
jest.mock('@/config/env', () => ({
  censysConfig: {
    hasCredentials: false
  }
}));

describe('CredentialsWarning', () => {
  it('shows warning when credentials are missing', () => {
    render(<CredentialsWarning />);
    expect(screen.getByText('Missing API Credentials')).toBeInTheDocument();
  });

  it('does not show warning when credentials are present', () => {
    // Override the mock for this test
    (censysConfig as jest.Mocked<typeof censysConfig>).hasCredentials = true;
    const { container } = render(<CredentialsWarning />);
    expect(container).toBeEmptyDOMElement();
  });
});
