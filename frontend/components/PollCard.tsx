'use client';

import { useState } from 'react';
import { Heart, Share2, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

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

interface PollCardProps {
  poll: Poll;
  onDelete: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export function PollCard({ poll, onDelete, showToast }: PollCardProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleVote = async (optionId: number) => {
    if (hasVoted) return;
    
    try {
      const response = await fetch(`https://quickpoll-api-p7ac.onrender.com/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId }),
      });
      
      if (response.ok) {
        setHasVoted(true);
        setSelectedOption(optionId);
        showToast('Vote recorded!', 'success');
      }
    } catch {
      showToast('Failed to record vote', 'error');
    }
  };

  const handleLike = async () => {
    if (hasLiked) return;
    
    try {
      const response = await fetch(`https://quickpoll-api-p7ac.onrender.com/api/polls/${poll.id}/like`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setHasLiked(true);
        showToast('Poll liked!', 'success');
      }
    } catch {
      showToast('Failed to like poll', 'error');
    }
  };

  const handleShare = () => {
    const pollUrl = `${window.location.origin}?poll=${poll.id}`;
    navigator.clipboard.writeText(pollUrl).then(() => {
      showToast('Poll link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://quickpoll-api-p7ac.onrender.com/api/polls/${poll.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showToast('Poll deleted successfully', 'success');
        onDelete();
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      showToast('Failed to delete poll', 'error');
    }
    setShowDeleteDialog(false);
  };

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <>
      <div className="bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        {/* Header with delete button */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            {poll.question}
          </h3>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-2"
            title="Delete poll"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="space-y-2.5 mb-4">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const isSelected = selectedOption === option.id;

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`w-full text-left relative overflow-hidden rounded-md border transition-all ${
                  hasVoted
                    ? isSelected
                      ? 'border-[#10a37f] bg-[#10a37f]/5 dark:bg-[#10a37f]/10'
                      : 'border-gray-200 dark:border-gray-700'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#10a37f] hover:bg-gray-50 dark:hover:bg-[#3d3d3d]'
                } ${hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {/* Progress bar background */}
                {hasVoted && (
                  <div
                    className="absolute inset-0 bg-[#10a37f]/10 dark:bg-[#10a37f]/20 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative px-4 py-3 flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {option.text}
                  </span>
                  <div className="flex items-center gap-3">
                    {hasVoted && (
                      <span className="text-sm font-semibold text-[#10a37f] dark:text-[#10a37f]">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {option.votes}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3d3d3d] transition-all"
              title="Share poll"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                hasLiked
                  ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3d3d3d]'
              }`}
            >
              <Heart
                size={16}
                className={hasLiked ? 'fill-current' : ''}
              />
              {poll.likes}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Poll"
          message="Are you sure you want to delete this poll? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </>
  );
}
