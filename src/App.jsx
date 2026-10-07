import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://study-planner-k817.onrender.com/api/tasks";

function App() {
  const [subject, setSubject] = useState("");
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get all tasks from backend
  const loadTasks = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  // Load tasks when page opens
  useEffect(() => {
    loadTasks();
  }, []);

  // Add or Update task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !task.trim()) {
      setMessage("⚠️ Please enter subject and task");
      return;
    }

    try {
      setMessage("");

      const taskData = {
        subject: subject,
        task: task,
        completed: false,
      };

      let response;

      if (editingId) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });
      }

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setSubject("");
      setTask("");
      setEditingId(null);

      setMessage(
        editingId
          ? "✅ Task updated successfully!"
          : "🎉 Task added successfully!"
      );

      await loadTasks();
    } catch (error) {
      console.error(error);
      setMessage("❌ Unable to save task");
    }
  };

  // Mark task completed / incomplete
  const toggleCompleted = async (item) => {
    try {
      const updatedTask = {
        subject: item.subject,
        task: item.task,
        completed: !item.completed,
      };

      const response = await fetch(`${API_URL}/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      await loadTasks();
    } catch (error) {
      console.error(error);
      setMessage("❌ Unable to update task");
    }
  };

  // Edit task
  const editTask = (item) => {
    setSubject(item.subject);
    setTask(item.task);
    setEditingId(item.id);
    setMessage("");
  };

  // Delete task
  const deleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setMessage("🗑️ Task deleted successfully!");
      await loadTasks();
    } catch (error) {
      console.error(error);
      setMessage("❌ Unable to delete task");
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setSubject("");
    setTask("");
    setEditingId(null);
    setMessage("");
  };

  const completedCount = tasks.filter((item) => item.completed).length;

  return (
    <div className="app-container">
      <div className="planner-card">

        <div className="header">
          <div className="flower">🌸</div>

          <h1>Study Planner</h1>

          <p>
            Plan your studies, complete your tasks and achieve your goals! 📚
          </p>
        </div>

        <div className="stats">
          <div className="stat-box">
            <span>📚</span>
            <strong>{tasks.length}</strong>
            <small>Total Tasks</small>
          </div>

          <div className="stat-box">
            <span>✅</span>
            <strong>{completedCount}</strong>
            <small>Completed</small>
          </div>

          <div className="stat-box">
            <span>⏳</span>
            <strong>{tasks.length - completedCount}</strong>
            <small>Remaining</small>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="task-form">

          <input
            type="text"
            placeholder="Enter subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter study task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />

          <button type="submit" className="add-button">
            {editingId ? "💾 Update Task" : "➕ Add Task"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={cancelEdit}
            >
              ❌ Cancel
            </button>
          )}
        </form>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        <div className="task-section">

          <h2>📋 My Study Tasks</h2>

          {loading ? (
            <div className="empty-message">
              ⏳ Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-message">
              🌷 No tasks yet. Add your first study task!
            </div>
          ) : (
            <div className="task-list">

              {tasks.map((item) => (
                <div
                  className={`task-card ${
                    item.completed ? "completed" : ""
                  }`}
                  key={item.id}
                >

                  <div className="task-info">

                    <h3>
                      {item.completed ? "✅ " : "📖 "}
                      {item.subject}
                    </h3>

                    <p>{item.task}</p>

                    <span className="status">
                      {item.completed
                        ? "Completed 🎉"
                        : "Not Completed ⏳"}
                    </span>

                  </div>

                  <div className="task-actions">

                    <button
                      onClick={() => toggleCompleted(item)}
                      className="complete-button"
                    >
                      {item.completed ? "↩️ Undo" : "✅ Done"}
                    </button>

                    <button
                      onClick={() => editTask(item)}
                      className="edit-button"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => deleteTask(item.id)}
                      className="delete-button"
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        <div className="footer">
          🌸 Stay focused • Study smart • Achieve your dreams 🌸
        </div>

      </div>
    </div>
  );
}

export default App;