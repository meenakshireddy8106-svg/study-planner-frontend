import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/tasks";

function App() {
  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error loading tasks:", error));
  }, []);

  const saveTask = async () => {
    if (!subject.trim() || !task.trim()) {
      alert("Please enter subject and task!");
      return;
    }

    const existingTask = tasks.find((item) => item.id === editingId);

    const taskData = {
      subject,
      task,
      completed: existingTask ? existingTask.completed : false,
    };

    try {
      if (editingId) {
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        const updatedTask = await response.json();

        setTasks(
          tasks.map((item) =>
            item.id === editingId ? updatedTask : item
          )
        );

        setEditingId(null);
      } else {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        const savedTask = await response.json();
        setTasks([...tasks, savedTask]);
      }

      setSubject("");
      setTask("");
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const editTask = (item) => {
    setEditingId(item.id);
    setSubject(item.subject);
    setTask(item.task);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSubject("");
    setTask("");
  };

  const toggleTask = async (id) => {
    const selectedTask = tasks.find((item) => item.id === id);

    const updatedTask = {
      subject: selectedTask.subject,
      task: selectedTask.task,
      completed: !selectedTask.completed,
    };

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      const savedTask = await response.json();

      setTasks(
        tasks.map((item) =>
          item.id === id ? savedTask : item
        )
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      setTasks(tasks.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (item) => item.completed
  ).length;
  const pendingTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="app">
      <div className="planner-card">
        <h1>🌸 Study Planner</h1>

        <p className="subtitle">
          Plan your studies and stay productive ✨
        </p>

        {/* Dashboard */}
        <div className="dashboard">
          <div className="stat-card">
            <span>📚</span>
            <h3>{totalTasks}</h3>
            <p>Total Tasks</p>
          </div>

          <div className="stat-card">
            <span>✅</span>
            <h3>{completedTasks}</h3>
            <p>Completed</p>
          </div>

          <div className="stat-card">
            <span>⏳</span>
            <h3>{pendingTasks}</h3>
            <p>Pending</p>
          </div>

          <div className="stat-card">
            <span>🌟</span>
            <h3>{progress}%</h3>
            <p>Progress</p>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-section">
          <div className="progress-title">
            <span>Study Progress</span>
            <strong>{progress}%</strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Add/Edit Task */}
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter study task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />

          <button onClick={saveTask}>
            {editingId ? "💾 Update Task" : "➕ Add Task"}
          </button>

          {editingId && (
            <button onClick={cancelEdit}>
              ❌ Cancel
            </button>
          )}
        </div>

        <h2>📚 My Tasks</h2>

        <div className="task-list">
          {tasks.length === 0 ? (
            <p className="empty">
              No tasks yet. Add your first study task! 🌷
            </p>
          ) : (
            tasks.map((item) => (
              <div
                className={`task-card ${
                  item.completed ? "completed" : ""
                }`}
                key={item.id}
              >
                <div>
                  <h3>{item.subject}</h3>
                  <p>{item.task}</p>
                </div>

                <div className="task-buttons">
                  <button onClick={() => toggleTask(item.id)}>
                    {item.completed ? "↩️ Undo" : "✅ Done"}
                  </button>

                  <button onClick={() => editTask(item)}>
                    ✏️ Edit
                  </button>

                  <button onClick={() => deleteTask(item.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="task-count">
          Total Tasks: <strong>{totalTasks}</strong>
        </div>
      </div>
    </div>
  );
}

export default App;