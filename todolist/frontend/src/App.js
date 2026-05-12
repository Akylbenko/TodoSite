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

function TaskItem({ task, onToggle, onDelete, onEdit, onAddSubtask }) {
  const [expanded, setExpanded]       = useState(true);
  const [editingId, setEditingId]     = useState(null);
  const [editingText, setEditingText] = useState('');
  const [addingSub, setAddingSub]     = useState(false);
  const [subTitle, setSubTitle]       = useState('');

  const startEditing = (t) => { setEditingId(t.id); setEditingText(t.title); };
  const cancelEditing = () => setEditingId(null);

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!subTitle.trim()) return;
    await onAddSubtask(task.id, subTitle, task.category);
    setSubTitle('');
    setAddingSub(false);
    setExpanded(true);
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-row">
        <button
          className={`check-btn ${task.completed ? 'checked' : ''}`}
          onClick={() => onToggle(task)}
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
                if (e.key === 'Enter') { onEdit(task, editingText); cancelEditing(); }
                if (e.key === 'Escape') cancelEditing();
              }}
              autoFocus
            />
          ) : (
            <>
              <div className="task-title" onClick={() => onToggle(task)}>{task.title}</div>
              <span className={`task-category ${task.category}`}>
                {CATEGORIES.find(c => c.value === task.category)?.label}
              </span>
            </>
          )}
        </div>

        <div className="task-actions">
          {editingId === task.id ? (
            <>
              <button className="icon-btn" onClick={() => { onEdit(task, editingText); cancelEditing(); }} aria-label="Сохранить">💾</button>
              <button className="icon-btn" onClick={cancelEditing} aria-label="Отмена">✖</button>
            </>
          ) : (
            <>
              {hasSubtasks && (
                <button className="icon-btn" onClick={() => setExpanded(!expanded)} aria-label="Свернуть/развернуть">
                  {expanded ? '▾' : '▸'}
                </button>
              )}
              <button className="icon-btn" onClick={() => setAddingSub(!addingSub)} aria-label="Добавить подзадачу">＋</button>
              <button className="icon-btn" onClick={() => startEditing(task)} aria-label="Редактировать">✏️</button>
              <button className="icon-btn danger" onClick={() => onDelete(task.id)} aria-label="Удалить">🗑️</button>
            </>
          )}
        </div>
      </div>

      {addingSub && (
        <form className="subtask-add-row" onSubmit={handleAddSub}>
          <input
            type="text"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
            placeholder="Текст подзадачи..."
            autoFocus
          />
          <button type="submit" className="btn-add-sub">Добавить</button>
          <button type="button" className="icon-btn" onClick={() => setAddingSub(false)}>✖</button>
        </form>
      )}

      {hasSubtasks && expanded && (
        <ul className="subtask-list">
          {task.subtasks.map(sub => (
            <li key={sub.id} className={`subtask-item ${sub.completed ? 'completed' : ''}`}>
              <button
                className={`check-btn small ${sub.completed ? 'checked' : ''}`}
                onClick={() => onToggle(sub)}
              >
                {sub.completed ? '✓' : ''}
              </button>
              {editingId === sub.id ? (
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { onEdit(sub, editingText); cancelEditing(); }
                    if (e.key === 'Escape') cancelEditing();
                  }}
                  autoFocus
                />
              ) : (
                <span className="task-title" onClick={() => onToggle(sub)}>{sub.title}</span>
              )}
              <div className="task-actions">
                {editingId === sub.id ? (
                  <>
                    <button className="icon-btn" onClick={() => { onEdit(sub, editingText); cancelEditing(); }}>💾</button>
                    <button className="icon-btn" onClick={cancelEditing}>✖</button>
                  </>
                ) : (
                  <>
                    <button className="icon-btn" onClick={() => startEditing(sub)}>✏️</button>
                    <button className="icon-btn danger" onClick={() => onDelete(sub.id)}>🗑️</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function App() {
  const [tasks, setTasks]             = useState([]);
  const [newTask, setNewTask]         = useState('');
  const [newCategory, setNewCategory] = useState('other');
  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('all');

  const fetchTasks = useCallback(async () => {
    try {
      const params = {};
      if (search)              params.search   = search;
      if (filterCat !== 'all') params.category = filterCat;
      const response = await axios.get(`${API_URL}/tasks/`, { params });
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
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
        title: newTask, completed: false, category: newCategory,
      });
      setTasks([response.data, ...tasks]);
      setNewTask('');
    } catch (error) {
      console.error('Ошибка добавления:', error);
    }
  };

  const addSubtask = async (parentId, title, category) => {
    try {
      await axios.post(`${API_URL}/tasks/create/`, {
        title, completed: false, category, parent: parentId,
      });
      fetchTasks();
    } catch (error) {
      console.error('Ошибка добавления подзадачи:', error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/update/${task.id}/`, {
        ...task, completed: !task.completed,
      });
      fetchTasks();
    } catch (error) {
      console.error('Ошибка обновления:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/delete/${id}/`);
      fetchTasks();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const editTask = async (task, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await axios.put(`${API_URL}/tasks/update/${task.id}/`, {
        ...task, title: newTitle,
      });
      fetchTasks();
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
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleComplete}
            onDelete={deleteTask}
            onEdit={editTask}
            onAddSubtask={addSubtask}
          />
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