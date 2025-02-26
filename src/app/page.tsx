import CensysSearch from "@/components/CensysSearch";
import { CredentialsWarning } from '@/components/CredentialsWarning';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Censys IPv4 Host Search</h1>
          <p className="text-gray-300 mt-1">Search for IPv4 hosts using the Censys API</p>
        </div>
      </header>

      <main className="py-8">
        <CredentialsWarning />
        <CensysSearch />
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center text-sm">
        <div className="max-w-4xl mx-auto">
          <p>Powered by Censys Search API</p>
        </div>
      </footer>
    </div>
  );
}
