import { useState, useEffect } from 'react';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { SubtaskDetailModal } from '@/components/tasks/SubtaskDetailModal';
import { Input } from '@/components/ui/input';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';
import { taskService } from '@/services/taskService';
import { toast } from 'sonner';

export default function TaskBoardPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await taskService.getAllTasks();
            if (res.ok) {
                setTasks(res.data);
            } else {
                toast.error('Không thể tải danh sách công việc');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter((task) =>
        (task.title || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleCardClick = (task) => {
        setSelectedTask(task);
        setShowDetail(true);
    };

    const handleAddCard = async (title, status) => {
        const newTask = {
            title,
            status,
            priority: 'medium',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

        try {
            const res = await taskService.createTask(newTask);
            if (res.ok) {
                setTasks([...tasks, res.data]);
                toast.success('Tạo công việc thành công');
            } else {
                toast.error('Không thể tạo công việc');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Lỗi kết nối server');
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

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
