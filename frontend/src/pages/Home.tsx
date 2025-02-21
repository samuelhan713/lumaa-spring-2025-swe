import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  is_complete: boolean;
}

const Home = () => {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data.sort((a: Task, b: Task) => b.id - a.id));
      } else {
        alert("Error fetching tasks");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Something went wrong!");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateTask = async () => {
    if (!createTitle.trim() || !createDescription.trim())
      return alert("Fill in all fields");

    try {
      const response = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: createTitle,
          description: createDescription,
          is_complete: false,
        }),
      });

      if (response.ok) {
        setCreateTitle("");
        setCreateDescription("");
        setShowCreateModal(false);
        fetchTasks();
      } else {
        alert("Error creating task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Something went wrong!");
    }
  };

  const startEditTask = (task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleEditTask = async (currentStatus: boolean) => {
    if (!editTask) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/tasks/${editTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            is_complete: currentStatus,
          }),
        }
      );

      if (response.ok) {
        setEditTask(null);
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === editTask.id
              ? {
                  ...task,
                  title: editTitle,
                  description: editDescription,
                  is_complete: currentStatus,
                }
              : task
          )
        );
      } else {
        alert("Error updating task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Something went wrong!");
    }
  };

  const toggleComplete = async (taskId: number, currentStatus: boolean) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const response = await fetch(
        `http://localhost:3001/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: taskToUpdate.title,
            description: taskToUpdate.description,
            is_complete: !currentStatus,
          }),
        }
      );

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, is_complete: !currentStatus } : task
          )
        );
      }
    } catch (error) {
      console.error("Error updating completion status:", error);
      alert("Something went wrong!");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(
        `http://localhost:3001/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      } else {
        alert("Error deleting task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Task Manager</h1>
      <button
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          background: "none",
          border: "none",
          textDecoration: "underline",
        }}
      >
        Logout
      </button>

      <button
        onClick={() => setShowCreateModal(true)}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          backgroundColor: "green",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "7px",
        }}
      >
        Create Task
      </button>

      {tasks.length > 0 ? (
        <div>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                width: "60%", // Adjust width as needed
                margin: "0 auto 15px auto", // Centering and spacing
                padding: "15px",
                backgroundColor: "#f4f4f4", // Light gray background
                borderRadius: "8px",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)", // Subtle shadow
              }}
            >
              <h3
                style={{
                  textDecoration: task.is_complete ? "line-through" : "none",
                  color: task.is_complete ? "gray" : "black",
                }}
              >
                {task.title} {task.is_complete && "✅"}
              </h3>
              <p>{task.description}</p>

              {/* Button Container */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => startEditTask(task)}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleComplete(task.id, task.is_complete)}
                  style={{
                    backgroundColor: task.is_complete ? "green" : "gray",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {task.is_complete ? "Mark Incomplete" : "Mark Complete"}
                </button>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No tasks available</p>
      )}

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "25px",
            boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
            borderRadius: "10px",
            width: "320px",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "15px", fontSize: "20px" }}>
            Create Task
          </h2>

          <input
            type="text"
            placeholder="Title"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            style={{
              width: "90%",
              padding: "8px",
              marginBottom: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />

          <textarea
            placeholder="Description"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            style={{
              width: "90%",
              padding: "8px",
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              resize: "none",
              height: "80px",
            }}
          />

          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <button
              onClick={handleCreateTask}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Create
            </button>

            <button
              onClick={() => setShowCreateModal(false)}
              style={{
                backgroundColor: "#ccc",
                color: "black",
                border: "none",
                padding: "8px 12px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editTask && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Edit Task</h2>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ display: "block", marginBottom: "10px" }}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            style={{ display: "block", marginBottom: "10px" }}
          />
          <button onClick={() => handleEditTask(editTask.is_complete)}>
            Update
          </button>
          <button
            onClick={() => setEditTask(null)}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
