import { useState } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';
import { SubtaskCardData } from '@/components/tasks/SubtaskCard';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';

// Mock data - công việc
const mockTasks: SubtaskCardData[] = [
  {
    id: '1',
    title: 'Soạn giáo án chương 1 - Đại số',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    department: 'Bộ môn Toán',
    status: 'completed',
    priority: 'high',
    deadline: '2024-05-03',
    progress: 100,
  },
  {
    id: '2',
    title: 'Soạn giáo án chương 2 - Hình học',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    department: 'Bộ môn Toán',
    status: 'completed',
    priority: 'medium',
    deadline: '2024-05-05',
    progress: 100,
  },
  {
    id: '3',
    title: 'Soạn giáo án chương 3 - Giải tích',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    department: 'Bộ môn Toán',
    status: 'in-progress',
    priority: 'high',
    deadline: '2024-05-08',
    progress: 60,
  },
  {
    id: '4',
    title: 'Thiết kế bài tập thực hành',
    assignee: { id: '6', name: 'Nguyễn Thị Lan' },
    department: 'Bộ môn Toán',
    status: 'waiting-approval',
    priority: 'medium',
    deadline: '2024-05-10',
    progress: 100,
  },
  {
    id: '5',
    title: 'Chuẩn bị đề kiểm tra giữa kỳ',
    assignee: { id: '7', name: 'Trần Văn Nam' },
    department: 'Bộ môn Lý',
    status: 'not-assigned',
    priority: 'low',
    deadline: '2024-05-15',
    progress: 0,
  },
  {
    id: '6',
    title: 'Rà soát nội dung chương 1',
    assignee: { id: '5', name: 'Hoàng Văn Nhân Viên' },
    department: 'Bộ môn Toán',
    status: 'returned',
    priority: 'high',
    deadline: '2024-05-06',
    progress: 80,
  },
  {
    id: '7',
    title: 'Upload tài liệu tham khảo',
    assignee: { id: '6', name: 'Nguyễn Thị Lan' },
    department: 'Bộ môn Toán',
    status: 'in-progress',
    priority: 'low',
    deadline: '2024-05-12',
    progress: 30,
  },
  {
    id: '8',
    title: 'Soạn slide bài giảng chương 4',
    assignee: { id: '8', name: 'Lê Thị Hoa' },
    department: 'Bộ môn Hóa',
    status: 'not-assigned',
    priority: 'medium',
    deadline: '2024-05-18',
    progress: 0,
  },
];

export default function TaskBoardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState<SubtaskCardData[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<SubtaskCardData | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCardClick = (task: SubtaskCardData) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  const handleAddCard = (title: string, status: SubtaskCardData['status']) => {
    const newTask: SubtaskCardData = {
      id: Date.now().toString(),
      title,
      assignee: { id: user?.id || '0', name: user?.name || 'Chưa gán' },
      department: user?.department || 'Chưa có',
      status,
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header đơn giản */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Bảng công việc</h1>
        <p className="text-muted-foreground text-sm">
          Quản lý và theo dõi công việc của bạn
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm công việc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          tasks={filteredTasks}
          onCardClick={handleCardClick}
          onAddCard={handleAddCard}
        />
      </div>

      {/* Chi tiết thẻ - Modal DUY NHẤT ngoài Kanban */}
      <SubtaskDetailModal
        open={showDetail}
        onOpenChange={setShowDetail}
        task={selectedTask}
      />
    </div>
  );
}
