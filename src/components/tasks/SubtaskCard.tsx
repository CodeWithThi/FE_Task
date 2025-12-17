import { TaskStatus, TaskPriority } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Paperclip, MessageSquare } from 'lucide-react';

export interface SubtaskCardData {
  id: string;
  title: string;
  description?: string;
  assignee: {
    id: string;
    name: string;
  };
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  progress: number;
  attachmentCount?: number;
  commentCount?: number;
}

interface SubtaskCardProps {
  subtask: SubtaskCardData;
  onClick?: () => void;
}

export function SubtaskCard({ subtask, onClick }: SubtaskCardProps) {
  const isOverdue = new Date(subtask.deadline) < new Date() && subtask.status !== 'completed';

  return (
    <div
      onClick={onClick}
      className="bg-card border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {subtask.title}
        </h4>
        <PriorityBadge priority={subtask.priority} />
      </div>

      {/* Description */}
      {subtask.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {subtask.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Tiến độ</span>
          <span className="font-medium">{subtask.progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${subtask.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {subtask.assignee.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
            {subtask.assignee.name}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-muted-foreground">
          {subtask.attachmentCount && subtask.attachmentCount > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span className="text-xs">{subtask.attachmentCount}</span>
            </div>
          )}
          {subtask.commentCount && subtask.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span className="text-xs">{subtask.commentCount}</span>
            </div>
          )}
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
            <Calendar className="w-3 h-3" />
            <span className="text-xs">
              {new Date(subtask.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3 pt-3 border-t">
        <StatusBadge status={subtask.status} />
      </div>
    </div>
  );
}
