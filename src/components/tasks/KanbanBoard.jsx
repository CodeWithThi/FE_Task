import { useState } from 'react';
import { statusLabels } from '@/types';
import { SubtaskCard } from './SubtaskCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
const columns = [
    { status: 'not-assigned', color: 'bg-gray-500' },
    { status: 'in-progress', color: 'bg-blue-500' },
    { status: 'waiting-approval', color: 'bg-amber-500' },
    { status: 'returned', color: 'bg-orange-500' },
    { status: 'completed', color: 'bg-green-500' },
];
export function KanbanBoard({ tasks, onCardClick, onAddCard }) {
    const [addingToColumn, setAddingToColumn] = useState(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const getTasksByStatus = (status) => {
        return tasks.filter((task) => task.status === status);
    };
    const handleAddCard = (status) => {
        if (newCardTitle.trim() && onAddCard) {
            onAddCard(newCardTitle.trim(), status);
            setNewCardTitle('');
            setAddingToColumn(null);
        }
    };
    const handleCancelAdd = () => {
        setNewCardTitle('');
        setAddingToColumn(null);
    };
    return (<div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            const isAdding = addingToColumn === column.status;
            return (<div key={column.status} className="flex-shrink-0 w-72 bg-muted/30 rounded-lg flex flex-col transition-colors duration-200">
            {/* Tiêu đề cột */}
            <div className="p-3 border-b bg-muted/50 rounded-t-lg transition-colors duration-200">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color} transition-colors duration-200`}/>
                <h3 className="font-medium text-sm">{statusLabels[column.status]}</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full transition-colors duration-200">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Nội dung cột */}
            <ScrollArea className="flex-1 min-h-[300px]">
              <div className="p-3 space-y-3">
                {columnTasks.length === 0 && !isAdding && (<div className="text-center py-8 text-muted-foreground text-sm">
                    Không có công việc
                  </div>)}
                
                {columnTasks.map((task) => (<SubtaskCard key={task.id} task={task} onClick={() => onCardClick?.(task)}/>))}

                {/* Form thêm thẻ mới */}
                {isAdding && (<div className="bg-card border rounded-lg p-3 space-y-2 animate-fade-in">
                    <Input placeholder="Nhập tên công việc..." value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter')
                            handleAddCard(column.status);
                        if (e.key === 'Escape')
                            handleCancelAdd();
                    }} autoFocus/>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddCard(column.status)} className="transition-all duration-200 hover:scale-105">
                        Thêm thẻ
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelAdd} className="transition-all duration-200 hover:scale-105">
                        <X className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>)}
              </div>
            </ScrollArea>

            {/* Nút thêm thẻ */}
            {!isAdding && onAddCard && (<div className="p-3 pt-0">
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted" onClick={() => setAddingToColumn(column.status)}>
                  <Plus className="w-4 h-4 mr-2"/>
                  Thêm thẻ
                </Button>
              </div>)}
          </div>);
        })}
    </div>);
}
