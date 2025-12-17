import { TaskStatus, statusLabels } from '@/types';
import { SubtaskCard, SubtaskCardData } from './SubtaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumn {
  status: TaskStatus;
  color: string;
}

const columns: KanbanColumn[] = [
  { status: 'not-assigned', color: 'bg-gray-500' },
  { status: 'in-progress', color: 'bg-blue-500' },
  { status: 'waiting-approval', color: 'bg-amber-500' },
  { status: 'returned', color: 'bg-orange-500' },
  { status: 'completed', color: 'bg-green-500' },
];

interface KanbanBoardProps {
  subtasks: SubtaskCardData[];
  onCardClick?: (subtask: SubtaskCardData) => void;
}

export function KanbanBoard({ subtasks, onCardClick }: KanbanBoardProps) {
  const getSubtasksByStatus = (status: TaskStatus) => {
    return subtasks.filter((subtask) => subtask.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnSubtasks = getSubtasksByStatus(column.status);
        
        return (
          <div
            key={column.status}
            className="flex-shrink-0 w-72 bg-muted/30 rounded-lg"
          >
            {/* Column Header */}
            <div className="p-3 border-b bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-medium text-sm">{statusLabels[column.status]}</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                  {columnSubtasks.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px]">
              <div className="p-3 space-y-3">
                {columnSubtasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Không có công việc
                  </div>
                ) : (
                  columnSubtasks.map((subtask) => (
                    <SubtaskCard
                      key={subtask.id}
                      subtask={subtask}
                      onClick={() => onCardClick?.(subtask)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
