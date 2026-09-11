'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { TodoStatsCards } from '@/components/todos/TodoStatsCards';
import { TodoForm } from '@/components/todos/TodoForm';
import { TodoFilterBar } from '@/components/todos/TodoFilterBar';
import { TodoList } from '@/components/todos/TodoList';
import { todoService } from '@/services/todoService';
import { authService } from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Todo, CreateTodoDTO, UpdateTodoDTO, TodoFilter, TodoStats } from '@/types/todo';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [stats, setStats] = useState<TodoStats>({ total: 0, completed: 0, pending: 0, completionRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<TodoFilter>({ status: 'all', priority: 'all', searchQuery: '' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await todoService.getTodos(filter);
      setTodos(items);
      const calculatedStats = await todoService.getStats(items);
      setStats(calculatedStats);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las tareas';
      showNotification('error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured()) {
        const user = await authService.getCurrentUser();
        if (!user) {
          router.replace('/login');
          return;
        }
        setUserEmail(user.email || 'Usuario');
      } else {
        setUserEmail('invitado@modo-demo.local');
      }
      loadData();
    };

    initAuth();
  }, [router, loadData]);

  // Actions
  const handleAddTodo = async (dto: CreateTodoDTO) => {
    try {
      const created = await todoService.createTodo(dto);
      showNotification('success', `Tarea "${created.title}" agregada correctamente.`);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo crear la tarea';
      showNotification('error', msg);
    }
  };

  const handleToggle = async (id: string, is_completed: boolean) => {
    try {
      await todoService.toggleTodo(id, is_completed);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo actualizar el estado';
      showNotification('error', msg);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      showNotification('info', 'Tarea eliminada exitosamente.');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar la tarea';
      showNotification('error', msg);
    }
  };

  const handleUpdate = async (id: string, updates: UpdateTodoDTO) => {
    try {
      await todoService.updateTodo(id, updates);
      showNotification('success', 'Tarea actualizada.');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo modificar la tarea';
      showNotification('error', msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar userEmail={userEmail} />

      <main className="app-container">
        {/* Floating Toast Notification */}
        {notification && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 100,
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background:
                notification.type === 'success'
                  ? 'rgba(16, 185, 129, 0.95)'
                  : notification.type === 'error'
                  ? 'rgba(239, 68, 68, 0.95)'
                  : 'rgba(99, 102, 241, 0.95)',
              color: '#ffffff',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 500,
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            {notification.type === 'success' && <CheckCircle2 size={18} />}
            {notification.type === 'error' && <AlertCircle size={18} />}
            {notification.type === 'info' && <Info size={18} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Dashboard Header Banner */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
            Panel de Tareas
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Organiza tus actividades, establece prioridades y mantén el control de tus metas diarias.
          </p>
        </div>

        {/* Stats Metrics */}
        <TodoStatsCards stats={stats} />

        {/* Create Todo Form */}
        <TodoForm onAddTodo={handleAddTodo} />

        {/* Filter and Search Bar */}
        <TodoFilterBar filter={filter} onFilterChange={setFilter} />

        {/* Task List */}
        <TodoList
          todos={todos}
          isLoading={isLoading}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </main>
    </div>
  );
}
