'use client';

import { useState } from 'react';
import { Heart, Check } from 'lucide-react';

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
}

export function PollCard({ poll }: { poll: Poll }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleVote = async (optionId: number) => {
    if (hasVoted) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId }),
      });
      
      if (response.ok) {
        setHasVoted(true);
        setSelectedOption(optionId);
      }
    } catch {
      // Silently handle error
    }
  };

  const handleLike = async () => {
    if (hasLiked) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/polls/${poll.id}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setHasLiked(true);
      }
    } catch {
      // Silently handle error
    }
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {poll.question}
      </h3>

      <div className="space-y-3 mb-4">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;

          return (
            <div key={option.id}>
              <button
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`w-full text-left relative overflow-hidden rounded-lg border-2 transition-all ${
                  hasVoted
                    ? isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                } ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {isSelected && hasVoted && (
                      <Check size={18} className="text-blue-600 dark:text-blue-400" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasVoted && (
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {percentage.toFixed(1)}%
                      </span>
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Total votes and like button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            hasLiked
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600'
          }`}
        >
          <Heart
            size={18}
            className={hasLiked ? 'fill-current' : ''}
          />
          {poll.likes}
        </button>
      </div>
    </div>
  );
}
