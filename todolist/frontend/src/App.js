import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://todo-backend-khi2.onrender.com';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks/`);
      setTasks(response.data);
    } catch (error) {
      console.error('Ошибка загрузки задач:', error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/tasks/create/`, {
        title: newTask,
        completed: false
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
        completed: !task.completed
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
        <button type="submit">Добавить</button>
      </form>

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <span onClick={() => toggleComplete(task)}>
              {task.completed ? '✅' : '⭕'} {task.title}
            </span>
            <button onClick={() => deleteTask(task.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;