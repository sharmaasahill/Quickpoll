'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/useWebSocket';
import { PollCard } from '@/components/PollCard';
import { Plus, AlertCircle } from 'lucide-react';

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  likes: number;
  created_at: string;
}

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const { lastMessage, isConnected } = useWebSocket('ws://localhost:8000/ws');

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to fetch polls from API
  const fetchPolls = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:8000/api/polls');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPolls(data);
      setIsLoading(false);
    } catch {
      setError('Failed to connect to backend. Make sure the backend server is running on http://localhost:8000');
      setIsLoading(false);
    }
  };

  // Fetch initial polls
  useEffect(() => {
    if (isMounted) {
      fetchPolls();
    }
  }, [isMounted]);

  // Listen for real-time updates
  useEffect(() => {
    if (lastMessage && isMounted) {
      fetchPolls();
    }
  }, [lastMessage, isMounted]);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (question.trim() === '' || validOptions.length < 2) {
      alert('Please enter a question and at least 2 options');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          options: validOptions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create poll');
      }

      setQuestion('');
      setOptions(['', '']);
      setShowCreateForm(false);
      fetchPolls();
    } catch {
      alert('Failed to create poll. Please try again.');
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // Don't render WebSocket-dependent UI until mounted
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex justify-center items-center h-96">
            <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              QuickPoll
          </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time opinion polling platform
          </p>
        </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            <Plus size={20} />
            Create Poll
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={fetchPolls}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Create New Poll
            </h2>
            <form onSubmit={handleCreatePoll}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Options
                </label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  + Add Option
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Create Poll
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connection Status Indicator */}
        <div className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg w-fit ${
          isConnected 
            ? 'bg-green-100 dark:bg-green-900' 
            : 'bg-yellow-100 dark:bg-yellow-900'
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-yellow-500'
          }`}></div>
          <span className={`font-medium ${
            isConnected 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {isConnected ? 'Live Updates Active' : 'Connecting...'}
          </span>
        </div>

        {/* Polls Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500 dark:text-gray-400">
              Loading polls...
            </p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-500 dark:text-gray-400">
              No polls yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
        </div>
      </main>
  );
}
