import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://todo-backend-khi2.onrender.com/api';

const CATEGORIES = [
  { value: 'all',      label: '🗂 Все' },
  { value: 'work',     label: '💼 Работа' },
  { value: 'personal', label: '🙋 Личное' },
  { value: 'shopping', label: '🛒 Покупки' },
  { value: 'other',    label: '📌 Другое' },
];

function App() {
  const [tasks, setTasks]               = useState([]);
  const [newTask, setNewTask]           = useState('');
  const [newCategory, setNewCategory]   = useState('other');
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('all');
  const [editingId, setEditingId]       = useState(null);
  const [editingText, setEditingText]   = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (search)              params.search   = search;
      if (filterCat !== 'all') params.category = filterCat;
      const response = await axios.get(`${API_URL}/tasks/`, { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    }
  }, [search, filterCat]);

  useEffect(() => {
    const timer = setTimeout(fetchTasks, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/tasks/create/`, {
        title: newTask,
        completed: false,
        category: newCategory,
      });
      setTasks([response.data, ...tasks]);
      setNewTask('');
    } catch (error) {
      console.error('Ошибка добавления:', error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/update/${task.id}/`, {
        ...task,
        completed: !task.completed,
      });
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/delete/${id}/`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  const saveEdit = async (task) => {
    if (!editingText.trim()) return;
    try {
      const response = await axios.put(`${API_URL}/tasks/update/${task.id}/`, {
        ...task,
        title: editingText,
      });
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
      setEditingId(null);
    } catch (error) {
      console.error('Ошибка редактирования:', error);
    }
  };

  const completed = tasks.filter(t => t.completed).length;

  return (
    <div className="App">
      <h1>📋 мой todo лист</h1>
      <p className="subtitle">{tasks.length} задач · {completed} выполнено</p>

      <div className="add-card">
        <form onSubmit={addTask}>
          <div className="add-row">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Добавить новую задачу..."
            />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button type="submit" className="btn-add">+ Добавить</button>
          </div>
        </form>

        <div className="divider" />

        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
            />
          </div>
          <div className="filter-buttons">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                className={filterCat === c.value ? 'active' : ''}
                onClick={() => setFilterCat(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="task-list">
        {tasks.length === 0 && (
          <div className="empty">Задач нет — самое время добавить!</div>
        )}
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <button
              className={`check-btn ${task.completed ? 'checked' : ''}`}
              onClick={() => toggleComplete(task)}
              aria-label="Отметить выполненной"
            >
              {task.completed ? '✓' : ''}
            </button>

            <div className="task-body">
              {editingId === task.id ? (
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(task);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                />
              ) : (
                <>
                  <div className="task-title" onClick={() => toggleComplete(task)}>
                    {task.title}
                  </div>
                  <span className={`task-category ${task.category}`}>
                    {CATEGORIES.find(c => c.value === task.category)?.label}
                  </span>
                </>
              )}
            </div>

            <div className="task-actions">
              {editingId === task.id ? (
                <>
                  <button className="icon-btn" onClick={() => saveEdit(task)} aria-label="Сохранить">💾</button>
                  <button className="icon-btn" onClick={() => setEditingId(null)} aria-label="Отмена">✖</button>
                </>
              ) : (
                <>
                  <button className="icon-btn" onClick={() => startEditing(task)} aria-label="Редактировать">✏️</button>
                  <button className="icon-btn danger" onClick={() => deleteTask(task.id)} aria-label="Удалить">🗑️</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {tasks.length > 0 && (
        <div className="stats">
          <div className="stat">
            <div className="stat-num">{tasks.length}</div>
            <div className="stat-label">всего</div>
          </div>
          <div className="stat">
            <div className="stat-num">{completed}</div>
            <div className="stat-label">выполнено</div>
          </div>
          <div className="stat">
            <div className="stat-num">{tasks.length - completed}</div>
            <div className="stat-label">осталось</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;