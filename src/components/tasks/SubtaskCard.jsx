import { PriorityBadge } from '@core/components/common/PriorityBadge';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { Calendar, Building2 } from 'lucide-react';
export function SubtaskCard({ task, onClick }) {
  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'completed';
  return (<div onClick={onClick} className="bg-card border rounded-lg p-3 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50 hover:scale-[1.02] group">
    {/* Tên công việc */}
    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-3">
      {task.title}
    </h4>

    {/* Phòng ban */}
    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
      <Building2 className="w-3 h-3" />
      <span className="truncate">{task.department || 'Chưa có phòng ban'}</span>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between">
      {/* Người thực hiện */}
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6 transition-transform duration-200 group-hover:scale-110">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {task.assignee?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground truncate max-w-[80px]">
          {task.assignee?.name ? task.assignee.name.split(' ').slice(-2).join(' ') : 'Chưa gán'}
        </span>
      </div>

      {/* Thời hạn & Độ ưu tiên */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 text-xs transition-colors duration-200 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
    </div>
  </div>);
}

