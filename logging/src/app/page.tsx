'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  service: string;
  level: string;
  message: string;
  timestamp: string;
  requestId?: string;
  metadata?: any;
}

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    service: '',
    level: '',
    limit: 100
  });

  // Fetch logs with current filter settings
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter.service) queryParams.append('service', filter.service);
      if (filter.level) queryParams.append('level', filter.level);
      queryParams.append('limit', filter.limit.toString());
      
      const response = await fetch(`/api/log?${queryParams.toString()}`);
      const data = await response.json();
      
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and poll for updates
  useEffect(() => {
    fetchLogs();
    
    // Poll for updates every 10 seconds
    // const interval = setInterval(fetchLogs, 10000);
    
    // return () => clearInterval(interval);
  }, [filter]);

  // Get log level color
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-700';
    }
  };

  // Handle filter change
  const handleFilterChange = (name: string, value: string | number) => {
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Centralized Logging Dashboard</h1>
      
      {/* Filter Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Service</label>
          <select 
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={filter.service}
            onChange={(e) => handleFilterChange('service', e.target.value)}
          >
            <option value="">All Services</option>
            <option value="sender">Sender</option>
            <option value="middleware">Middleware</option>
            <option value="receiver">Receiver</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Log Level</label>
          <select 
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={filter.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Limit</label>
          <select 
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={filter.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
          >
            <option value="10">10 entries</option>
            <option value="50">50 entries</option>
            <option value="100">100 entries</option>
            <option value="500">500 entries</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex-grow overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-grow">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">No logs found matching the current filters.</p>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="px-4 py-2 text-left">Timestamp</th>
                  <th className="px-4 py-2 text-left">Service</th>
                  <th className="px-4 py-2 text-left">Level</th>
                  <th className="px-4 py-2 text-left">Message</th>
                  <th className="px-4 py-2 text-left">Request ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium uppercase bg-gray-100 dark:bg-gray-600">
                        {log.service}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{log.message}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{log.requestId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
