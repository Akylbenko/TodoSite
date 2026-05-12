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
  const [tasks, setTasks]             = useState([]);
  const [newTask, setNewTask]         = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('all');
  const [editingId, setEditingId]     = useState(null);
  const [editingText, setEditingText] = useState('');

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
      console.error('Ошибка добавления задачи:', error);
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

  return (
    <div className="App">
      <h1>📋 Мой TODO Лист</h1>

      <form onSubmit={addTask}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Введи новую задачу..."
        />
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          {CATEGORIES.filter(c => c.value !== 'all').map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <button type="submit">Добавить</button>
      </form>

      <div className="controls">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Поиск..."
        />
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

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <span onClick={() => toggleComplete(task)}>
              {task.completed ? '✅' : '⭕'}
            </span>
            {editingId === task.id ? (
              <>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(task)}
                  autoFocus
                />
                <button onClick={() => saveEdit(task)}>💾</button>
                <button onClick={() => setEditingId(null)}>✖️</button>
              </>
            ) : (
              <>
                <span className="task-title">{task.title}</span>
                <span className="task-category">
                  {CATEGORIES.find(c => c.value === task.category)?.label}
                </span>
                <button onClick={() => startEditing(task)}>✏️</button>
                <button onClick={() => deleteTask(task.id)}>🗑️</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;