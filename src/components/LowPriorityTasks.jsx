import React, { useState, useEffect } from "react";
import "../assets/css/login.css";
import "../assets/css/priorities.css";

const LowPriorityTasks = ({ backendUrl, userId }) => {
  const [checklist, setChecklist] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", note: "", checklistType: "Morning" });
  const [activeTask, setActiveTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState({ feeling: "", context: "", time: "" });

  const checklistTypes = ["Morning", "LateMorning", "Afternoon", "Evening", "Night"];

  const fetchLowPriorityTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const responses = await Promise.all(
        checklistTypes.map((type) =>
          fetch(`${backendUrl}/checklist/getLowpriority`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, checklistType: type }),
          })
        )
      );

      const results = await Promise.all(responses.map((response) => response.json()));

      const combinedData = results.reduce((acc, result, index) => {
        if (responses[index].ok && result.success) {
          return [...acc, { checklistType: checklistTypes[index], items: result.data }];
        } else {
          console.error(`Error fetching ${checklistTypes[index]} checklist:`, result.message);
          return acc;
        }
      }, []);

      setChecklist(combinedData);

      const updatedCheckedItems = {};
      combinedData.forEach((checklistItem) => {
        checklistItem.items.forEach((item) => {
          updatedCheckedItems[item._id] = item.completed;
        });
      });
      setCheckedItems(updatedCheckedItems);
    } catch (err) {
      setError("An error occurred while fetching Low-priority tasks.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (task, checklistType) => {
    // const currentState = !!checkedItems[task._id];
    // setCheckedItems((prevState) => ({
    //   ...prevState,
    //   [task._id]: !currentState,
    // }));
    // toggleCompletion(userId, checklistType, task._id, !currentState);
    setActiveTask((prevActiveTask) => (prevActiveTask === task._id ? null : task._id));
    if (activeTask !== task._id) {
      setTaskDetails({ feeling: "", context: "", time: "" }); // Reset fields only if a new task is opened
    }
  };

  const handleInputChange = (field, value) => {
    setTaskDetails((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSave = async (checklistType, task) => {
    const userId = localStorage.getItem("userId");
    try {
      // Create the activity
      const response = await fetch(`${backendUrl}/activity/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          date: new Date().toISOString(),
          name: task.name,
          time: new Date().toISOString(),
          context: taskDetails.context,
          feeling: taskDetails.feeling,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to save activity.");
      }

      // Update task as completed
      await toggleCompletion(userId, checklistType, task._id, true);
      setActiveTask(null); // Close dropdown
    } catch (err) {
      setError("Failed to save activity.");
      console.error(err);
    }
  };

  const toggleCompletion = async (userId, checklistType, taskId, isCompleted) => {
    try {
      const response = await fetch(`${backendUrl}/checklist/toggle-completion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, checklistType, taskId, isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion.");
      }

      fetchLowPriorityTasks();
    } catch (err) {
      setError("Failed to update task completion.");
      console.error(err);
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await fetch(`${backendUrl}/checklist/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          checklistType: newTask.checklistType,
          customItems: [
            { name: newTask.name, note: newTask.note, completed: false, priority: "low" },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add new task.");
      }

      setNewTask({ name: "", note: "", checklistType: "Morning" });
      setShowForm(false);
      fetchLowPriorityTasks();
    } catch (err) {
      setError("Failed to add new task.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLowPriorityTasks();
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-green-500">Low Priority Tasks</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xl bg-green-500 text-white px-2 py-1 rounded-full"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="mt-4 p-4 border rounded custom-bg-color">
          <h4 className="font-semibold mb-2">Add New Task</h4>
          <div className="mb-2">
            <label className="block text-sm">Task Name</label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              placeholder="Enter The Task Name"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Note</label>
            <input
              type="text"
              value={newTask.note}
              onChange={(e) => setNewTask({ ...newTask, note: e.target.value })}
              placeholder="Enter The Task Note"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Checklist Type</label>
            <select
              value={newTask.checklistType}
              onChange={(e) => setNewTask({ ...newTask, checklistType: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {checklistTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddTask}
            className="bg-white text-black px-4 py-2 rounded"
          >
            Add Task
          </button>
        </div>
      )}

      {loading && <p className="text-blue-500">Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-4 color-white">
        {checklist.length > 0 ? (
          checklist.map((checklistItem) => (
            <div key={checklistItem.checklistType} className="mb-6 checklist-group">
              <h4 className="font-bold text-lg text-white mb-2">
                {checklistItem.checklistType} Tasks
              </h4>
              <ul>
                {checklistItem.items.map((task) => (
                  <li
                    key={task._id}
                    className={`flex items-center mb-2 p-2 rounded ${
                      checkedItems[task._id] ? "task-completed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={task._id}
                      checked={!!checkedItems[task._id]}
                      onChange={() => handleCheckboxChange(task, checklistItem.checklistType)}
                      className="mr-2 mt-1"
                    />
                    <div>
                      <label
                        htmlFor={task._id}
                        className={`font-medium ${
                          checkedItems[task._id] ? "line-through" : ""
                        }`}
                      >
                        {task.name}
                      </label>
                      {task.note && (
                        <p className="text-sm text-gray-600 pl-6">{task.note}</p>
                      )}
                    </div>
                    {activeTask === task._id && (
                        <div className="slide-down mt-4 p-4 rounded custom-bg-color w-full">
                          <div className="mb-2">
                            <label htmlFor="feeling">Feeling:</label>
                            <select
                              id="feeling"
                              value={taskDetails.feeling}
                              onChange={(e) => handleInputChange("feeling", e.target.value)}
                              className="ml-2 border rounded p-2"
                            >
                              <option value="">Select...</option>
                              <option value="Good">Good</option>
                              <option value="Great">Great</option>
                              <option value="Bad">Bad</option>
                            </select>
                          </div>
                          <div className="mb-2 py-4">
                            <label>Time:</label>
                            <span className="ml-2">{new Date().toLocaleTimeString()}</span>
                          </div>
                          <div className="mb-2">
                            <label htmlFor="context" className="m-2">Context:</label>
                            <textarea
                              id="context"
                              value={taskDetails.context}
                              placeholder="Enter The Context"
                              onChange={(e) => handleInputChange("context", e.target.value)}
                              className="ml-2 border rounded w-full m-2 mt-4"
                            />
                          </div>
                          <button
                            onClick={() => handleSave(checklistItem.checklistType, task)}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                          >
                            Save
                          </button>
                        </div>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No Low-priority tasks available.</p>
        )}
      </div>
    </div>
  );
};

export default LowPriorityTasks;
