import { useState } from 'react';
import { Avatar, AvatarFallback } from '@core/components/ui/avatar';
import { Eye, EyeOff } from 'lucide-react';

export function SubtaskCard({ task, onClick }) {
  const [showLabels, setShowLabels] = useState(true);

  // Get members from Task_Member relation
  const members = task.Task_Member?.map(tm => ({
    id: tm.Member?.M_ID,
    name: tm.Member?.FullName || 'Unknown',
    initial: (tm.Member?.FullName || 'U').charAt(0).toUpperCase()
  })) || [];

  // Fallback to single assignee
  if (members.length === 0 && task.assignee) {
    members.push({
      id: task.assignee.id,
      name: task.assignee.name,
      initial: (task.assignee.name || 'U').charAt(0).toUpperCase()
    });
  }

  const handleToggleLabels = (e) => {
    e.stopPropagation();
    setShowLabels(!showLabels);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-3
                 shadow-sm hover:shadow-md
                 border border-gray-200 dark:border-gray-700
                 cursor-pointer transition-all duration-200
                 hover:border-blue-300 dark:hover:border-blue-600
                 group relative"
    >
      {/* Eye Toggle for Labels - top right corner */}
      {task.labels && task.labels.length > 0 && (
        <button
          onClick={handleToggleLabels}
          className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100
                     bg-white/80 dark:bg-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-600 
                     transition-all duration-200 z-10 shadow-sm"
          title={showLabels ? 'Ẩn nhãn' : 'Hiện nhãn'}
        >
          {showLabels ? (
            <Eye className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
      )}

      {/* Color Labels at Top */}
      {showLabels && task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label, index) => (
            <div
              key={label.id || index}
              className="h-2 w-12 rounded-full"
              style={{ backgroundColor: label.color || '#94a3b8' }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 
                     leading-snug line-clamp-2 pr-6 mb-2">
        {task.title}
      </h4>

      {/* Footer with Members */}
      {members.length > 0 && (
        <div className="flex items-center justify-end">
          <div className="flex -space-x-1.5">
            {members.slice(0, 3).map((member, index) => (
              <Avatar
                key={member.id || index}
                className="w-6 h-6 border-2 border-white dark:border-gray-800
                         ring-1 ring-gray-200 dark:ring-gray-700"
                title={member.name}
              >
                <AvatarFallback className="text-[10px] font-semibold
                                         bg-gradient-to-br from-indigo-500 to-purple-500 
                                         text-white">
                  {member.initial}
                </AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="w-6 h-6 rounded-full 
                            bg-gray-100 dark:bg-gray-600 
                            border-2 border-white dark:border-gray-800
                            ring-1 ring-gray-200 dark:ring-gray-700
                            flex items-center justify-center
                            text-[9px] font-bold text-gray-600 dark:text-gray-300">
                +{members.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
