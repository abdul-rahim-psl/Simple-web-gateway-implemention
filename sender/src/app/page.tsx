'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [destination, setDestination] = useState('http://localhost:3001/api/process');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    
    try {
      const response = await fetch('/api/forward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          destination,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to forward the text');
      }
      
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error:', err);
      setError((err as Error).message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="z-10 w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-center dark:text-white">String Forwarder</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text to forward:
            </label>
            <input
              type="text"
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:text-white"
              placeholder="Enter text..."
              required
            />
          </div>
          
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Destination URL:
            </label>
            <input
              type="url"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border dark:bg-gray-700 dark:text-white"
              placeholder="http://localhost:3001/api/process"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Forward Text'}
          </button>
        </form>
        
        {error && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Error:</h2>
            <div className="bg-red-50 p-3 rounded-md dark:bg-red-900/30">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
        
        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">Response:</h2>
            <div className="bg-gray-100 p-3 rounded-md dark:bg-gray-700 overflow-auto max-h-60">
              <pre className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
