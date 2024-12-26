import { useState, useEffect } from "react";
import "../output.css";
import "../assets/css/login.css";
import "../assets/css/priorities.css";
import Navbar from "../components/Navbar";
import PriorityTasks from "../components/PriorityTasks";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const [checklist, setChecklist] = useState([]);
  const [error, setError] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState({ feeling: "", context: "", time: "" });

  const checklistTypes = ["Morning", "LateMorning", "Afternoon", "Evening", "Night"];

  const fetchChecklist = async () => {
    const userId = localStorage.getItem("userId");
    try {
      const responses = await Promise.all(
        checklistTypes.map((type) =>
          fetch(`${backendUrl}/checklist/getpriority`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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
      setError("An error occurred while fetching the checklist.");
      console.error(err);
    }
  };

  const handleCheckboxChange = (checklistType, item) => {
    setActiveTask((prevActiveTask) => (prevActiveTask === item._id ? null : item._id));
    if (activeTask !== item._id) {
      setTaskDetails({ feeling: "", context: "", time: "" }); // Reset fields only if a new task is opened
    }
  };
  
  const handleInputChange = (field, value) => {
    setTaskDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (checklistType, item) => {
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
          name: item.name,
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
      await toggleCompletion(userId, checklistType, item._id, true);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, checklistType, taskId, isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task completion status.");
      }

      fetchChecklist(); // Refresh checklist
    } catch (err) {
      setError("Failed to update task completion.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, []);

  return (
    <>
      <Navbar />
      <div className="checklist-main">
        <h1 className="text-3xl font-bold mt-6 color-white">Checklist</h1>
        <PriorityTasks backendUrl={backendUrl} fetchChecklist={fetchChecklist} checklistTypes={checklistTypes} />
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <ul className="mt-6">
          {checklist.length > 0 ? (
            checklist.map((checklistItem) => (
              <li key={checklistItem.checklistType} className="mb-4 p-4 border rounded-lg color-white">
                <h3 className="font-semibold text-lg mb-2">{checklistItem.checklistType}</h3>
                <ul>
                  {checklistItem.items.map((item) => (
                    <li
                      key={item._id}
                      className={`flex flex-col items-start mb-2 p-2 rounded ${
                        checkedItems[item._id] ? "bg-green-100 text-green-800" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={item._id}
                          checked={!!checkedItems[item._id]}
                          onChange={() => handleCheckboxChange(checklistItem.checklistType, item)}
                          className="mr-2 mt-1"
                        />
                        <label
                          htmlFor={item._id}
                          className={`font-medium padding-main ${checkedItems[item._id] ? "line-through" : ""}`}
                        >
                          {item.name}
                        </label>
                      </div>
                      {activeTask === item._id && (
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
                            onClick={() => handleSave(checklistItem.checklistType, item)}
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))
          ) : (
            <p className="text-gray-500 mt-4">No checklist items available.</p>
          )}
        </ul>
      </div>
    </>
  );
};

export default Home;
