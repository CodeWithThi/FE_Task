import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { roleLabels, statusLabels, priorityLabels } from '@/models';
import { SubtaskCard } from './SubtaskCard';
import { ScrollArea } from '@core/components/ui/scroll-area';
import { Button } from '@core/components/ui/button';
import { Input } from '@core/components/ui/input';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const columns = [
  { status: 'not-assigned', color: 'bg-gray-500' },
  { status: 'running', color: 'bg-blue-500' }, // Changed to 'running' to match common project status or keep 'in-progress' if backend uses that
  { status: 'waiting-approval', color: 'bg-amber-500' },
  { status: 'returned', color: 'bg-orange-500' },
  { status: 'completed', color: 'bg-green-500' },
];

// Note: Backend might use 'in-progress' or 'running'. Ensure alignment with TaskBoardPage.
// Based on previous files, 'running' was used in WorkspacePage labels but 'in-progress' might be the key.
// Let's check statusLabels import if possible, or support both maps. 
// Assuming 'not-assigned', 'running', 'waiting-approval', 'returned', 'completed' based on user request.

function SortableItem({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SubtaskCard task={task} onClick={onClick} />
    </div>
  );
}

function KanbanColumn({ column, tasks, onCardClick, onAddCard }) {
  const { setNodeRef } = useSortable({ id: column.status, data: { type: 'Column', column } });

  const [isAdding, setIsAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleAdd = () => {
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle.trim(), column.status);
      setNewCardTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72 bg-muted/30 rounded-lg flex flex-col h-full max-h-full">
      <div className="p-3 border-b bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <h3 className="font-medium text-sm">{statusLabels[column.status] || column.status}</h3>
          <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3 min-h-[100px]">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <SortableItem key={task.id} task={task} onClick={() => onCardClick?.(task)} />
            ))}
          </SortableContext>

          {tasks.length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground text-sm opacity-50">
              Thả thẻ vào đây
            </div>
          )}

          {/* Add Card Form */}
          {isAdding && (
            <div className="bg-card border rounded-lg p-3 space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <Input
                placeholder="Nhập tên..."
                value={newCardTitle}
                onChange={e => setNewCardTitle(e.target.value)}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>Thêm</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}><X className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {!isAdding && onAddCard && (
        <div className="p-3 pt-0">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm thẻ
          </Button>
        </div>
      )}
    </div>
  );
}

export function KanbanBoard({ tasks, onCardClick, onAddCard, onTaskUpdate }) {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnsWithTasks = useMemo(() => {
    const map = {};
    columns.forEach(c => map[c.status] = []);
    tasks.forEach(task => {
      // Normalize task status to match columns logic (e.g. handle casing or minor mismatch)
      const s = (task.status || 'not-assigned').toLowerCase().replace(' ', '-');
      // Map common variations if needed
      let target = s;
      if (s === 'in-progress') target = 'running';

      if (map[target]) {
        map[target].push(task);
      } else {
        // Fallback for unknown status
        if (!map['not-assigned']) map['not-assigned'] = [];
        map['not-assigned'].push(task);
      }
    });
    return map;
  }, [tasks]);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find containers (columns)
    // If over a column directly
    let overContainer = columns.find(c => c.status === overId)?.status;

    // If over a task, find its column
    if (!overContainer) {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        // Handle mapping again
        let s = (overTask.status || 'not-assigned').toLowerCase().replace(' ', '-');
        if (s === 'in-progress') s = 'running';
        overContainer = s;
      }
    }

    if (overContainer) {
      const task = tasks.find(t => t.id === activeId);
      // Normalize current status
      let currentStatus = (task.status || 'not-assigned').toLowerCase().replace(' ', '-');
      if (currentStatus === 'in-progress') currentStatus = 'running';

      if (currentStatus !== overContainer) {
        // Status changed!
        // Optimistic update handled by parent or just Trigger callback
        // For smoother UI, we might want local state but props is cleaner for now
        if (onTaskUpdate) {
          // Determine actual backend value for status
          // e.g. 'running' -> 'in-progress' or 'Running' depending on backend
          // Assuming backend accepts these keys
          onTaskUpdate(task, overContainer);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
        {columns.map(col => (
          <KanbanColumn
            key={col.status}
            column={col}
            tasks={columnsWithTasks[col.status] || []}
            onCardClick={onCardClick}
            onAddCard={onAddCard}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <div className="opacity-80 rotate-2 cursor-grabbing"><SubtaskCard task={activeTask} /></div> : null}
      </DragOverlay>
    </DndContext>
  );
}

