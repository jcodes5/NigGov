import type { Feedback } from '@/types/server';
import { FeedbackItem } from './feedback-item';

interface FeedbackListProps {
  feedbackItems: Feedback[];
}

export function FeedbackList({ feedbackItems }: FeedbackListProps) {
  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No feedback yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  // Sort feedback by newest first
  const sortedFeedback = [...feedbackItems].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {sortedFeedback.map(item => (
        <FeedbackItem key={item.id} feedback={item} />
      ))}
    </div>
  );
}
