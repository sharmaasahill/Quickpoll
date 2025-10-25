'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/useWebSocket';
import { PollCard } from '@/components/PollCard';
import { Toast } from '@/components/Toast';
import { Plus, AlertCircle } from 'lucide-react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const { lastMessage, isConnected } = useWebSocket('wss://quickpoll-api-p7ac.onrender.com/ws');

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to fetch polls from API
  const fetchPolls = async () => {
    try {
      setError(null);
      const response = await fetch('https://quickpoll-api-p7ac.onrender.com/api/polls');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPolls(data);
      setIsLoading(false);
    } catch {
      setError('Failed to connect to backend. Please try again later.');
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
      showToast('Please enter a question and at least 2 options', 'warning');
      return;
    }

    try {
      const response = await fetch('https://quickpoll-api-p7ac.onrender.com/api/polls', {
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
      showToast('Poll created successfully!', 'success');
      fetchPolls();
    } catch {
      showToast('Failed to create poll. Please try again.', 'error');
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
    <main className="min-h-screen bg-white dark:bg-[#212121]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white mb-1">
              QuickPoll
          </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Real-time opinion polling platform
          </p>
        </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 bg-[#10a37f] hover:bg-[#0d8c6f] text-white px-5 py-2.5 rounded-md font-medium transition-colors"
          >
            <Plus size={18} />
            New Poll
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-sm">Connection Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button 
                onClick={fetchPolls}
                className="mt-2 text-sm text-red-800 underline hover:no-underline"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-[#2d2d2d] rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-5 text-gray-900 dark:text-white">
              Create New Poll
            </h2>
            <form onSubmit={handleCreatePoll}>
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What's your question?"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#10a37f] focus:border-[#10a37f] dark:bg-[#3d3d3d] dark:text-white"
                  required
                />
              </div>

              <div className="mb-5">
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
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#10a37f] focus:border-[#10a37f] dark:bg-[#3d3d3d] dark:text-white"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-[#10a37f] hover:text-[#0d8c6f] font-medium text-sm"
                >
                  + Add Option
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-[#10a37f] hover:bg-[#0d8c6f] text-white px-5 py-2.5 rounded-md font-medium transition-colors"
                >
                  Create Poll
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connection Status Indicator */}
        <div className={`flex items-center gap-2 mb-6 px-3 py-1.5 rounded-md w-fit text-sm ${
          isConnected 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-yellow-500'
          }`}></div>
          <span className={`font-medium ${
            isConnected 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
        </div>

        {/* Polls Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">
              Loading polls...
            </p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400">
              No polls yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => (
              <PollCard 
                key={poll.id} 
                poll={poll}
                onDelete={fetchPolls}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      </main>
  );
}
