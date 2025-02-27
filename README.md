# Censys IPv4 Host Search Application

This is a modern web application built with Next.js and TypeScript that allows users to search for IPv4 hosts using the Censys Search API.

## Features

- Search for IPv4 hosts using Censys query syntax
- Display search results with IP addresses and protocol counts
- Paginated results with next/previous navigation
- Example queries to help users get started
- Responsive design for desktop and mobile devices

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- A Censys API account

## Environment Variables

This application requires Censys API credentials to function. The application will not work without proper credentials.

1. Create a `.env.local` file in the root directory (you can copy the .env.example to start)
2. Add the following environment variables:

```
NEXT_PUBLIC_CENSYS_API_ID=your_censys_api_id
NEXT_PUBLIC_CENSYS_SECRET_KEY=your_censys_secret_key
```

Note: 
- The application has no fallback credentials and will not function without proper API credentials set in the `.env.local` file.
- The `.env.local` file is automatically excluded from Git, so your credentials won't be committed to your repository.

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables as described above

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## API Integration

This application uses the Censys Search API v2 to fetch IPv4 host data. The API endpoint used is:

```
https://search.censys.io/api/v2/hosts/search
```

For more information about the Censys API, visit the [Censys API Documentation](https://search.censys.io/api).

## Technologies Used

- Next.js 14
- TypeScript
- React Query for data fetching and caching
- Axios for API requests
- Tailwind CSS for styling
- Jest and React Testing Library for testing

## Using the Application

### Search Functionality

The application allows you to search for IPv4 hosts using Censys query syntax. Here's how to use the search feature:

1. Enter a search query in the search box. Here are some example queries:
   - `services.service_name: HTTP` - Find hosts running HTTP services
   - `ip: 8.8.8.8` - Look up a specific IP address
   - `services.port: 443 AND services.service_name: HTTPS` - Find hosts with HTTPS on port 443
   - `autonomous_system.name: "Google"` - Find hosts in Google's autonomous system

2. Use the pagination controls at the bottom of the results to navigate between pages.

3. Click on an IP address in the results to view more detailed information.

### Search Options

The Censys API supports several search options that can be added to your query:

- **Basic Filters**:
  - `services.port: 22` - Filter by port number
  - `services.service_name: SSH` - Filter by service name
  - `location.country: US` - Filter by country
  - `autonomous_system.name: "Amazon"` - Filter by AS name

- **Advanced Queries**:
  - Exclusions with `NOT`: `services.port: 80 AND NOT location.country: US`
  - Range searches: `services.port: [8000 TO 9000]`


## Running Tests

The application uses Jest and React Testing Library for testing. Tests cover components, API services, and utility functions.

### Running all tests

```bash
npm test
```

### Running tests with watch mode

```bash
npm test -- --watch
```

### Running tests for a specific file

```bash
npm test -- __tests__/components/SearchForm.test.tsx
```

### Running tests with coverage report

```bash
npm test -- --coverage
```

### Test Environment

Tests use mocked API credentials and do not require actual Censys API credentials to run. The test environment is configured to:

- Mock API responses
- Provide test credentials for components
- Isolate tests from actual API calls

## Building for Production

```bash
npm run build
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## TODO Nice To Have
- Persist search settings - link to search page with query parameters