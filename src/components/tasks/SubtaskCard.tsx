import { TaskStatus, TaskPriority } from '@/types';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Building2 } from 'lucide-react';

export interface SubtaskCardData {
  id: string;
  title: string;
  description?: string;
  assignee: {
    id: string;
    name: string;
  };
  department?: string;
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
      className="bg-card border rounded-lg p-3 hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group"
    >
      {/* Title */}
      <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-3">
        {subtask.title}
      </h4>

      {/* Info Row */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <Building2 className="w-3 h-3" />
        <span className="truncate">{subtask.department || 'Bộ môn Toán'}</span>
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
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {subtask.assignee.name.split(' ').slice(-2).join(' ')}
          </span>
        </div>

        {/* Deadline & Priority */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(subtask.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
          <PriorityBadge priority={subtask.priority} />
        </div>
      </div>
    </div>
  );
}
