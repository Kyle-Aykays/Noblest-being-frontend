// import { useState, useEffect } from "react";

// const backendUrl = import.meta.env.VITE_BACKEND_URL;
// const PriorityTasks = ({  fetchChecklist }) => {
//     const [priorityTasks, setPriorityTasks] = useState({
//         high: [],
//         medium: [],
//         low: [],
//     });
//     const [taskData, setTaskData] = useState({
//         name: "",
//         note: "",
//         priority: "medium",
//         checklistType: "Morning",
//     });
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     // Fetch tasks on component mount
//     useEffect(() => {
//         fetchPriorityTasks();
//     }, []);

//     const fetchPriorityTasks = async () => {
//         const userId = localStorage.getItem("userId");
//         setLoading(true);
//         setError("");

//         try {
//             // Fetch tasks for all priority levels
//             const [highRes, mediumRes, lowRes] = await Promise.all([
//                 fetch(`${backendUrl}/checklist/gethighpriority`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({ userId }),
//                 }),
//                 fetch(`${backendUrl}/checklist/getmediumpriority`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({ userId }),
//                 }),
//                 fetch(`${backendUrl}/checklist/getlowpriority`, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({ userId }),
//                 }),
//             ]);
//             console.log(userId);
//             console.log(`${backendUrl}/checklist/gethighpriority`);

//             if (highRes.ok && mediumRes.ok && lowRes.ok) {
//                 const [highData, mediumData, lowData] = await Promise.all([
//                     highRes.json(),
//                     mediumRes.json(),
//                     lowRes.json(),
//                 ]);

//                 setPriorityTasks({
//                     high: highData.data || [],
//                     medium: mediumData.data || [],
//                     low: lowData.data || [],
//                 });
//             } else {
//                 throw new Error("Failed to fetch tasks.");
//             }
//         } catch (err) {
//             console.error(err);
//             setError("An error occurred while fetching tasks.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleTaskSubmit = async (e) => {
//         e.preventDefault();
//         const userId = localStorage.getItem("userId");

//         try {
//             const response = await fetch(`${backendUrl}/checklist/create`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     userId,
//                     checklistType: taskData.checklistType,
//                     customItems: [
//                         {
//                             name: taskData.name,
//                             note: taskData.note,
//                             completed: false,
//                             priority: taskData.priority,
//                         },
//                     ],
//                 }),
//             });

//             if (response.ok) {
//                 setTaskData({
//                     name: "",
//                     note: "",
//                     priority: "medium",
//                     checklistType: "Morning",
//                 });
//                 await fetchPriorityTasks();
//                 await fetchChecklist();
//             } else {
//                 throw new Error("Failed to create task.");
//             }
//         } catch (err) {
//             console.error(err);
//             setError("An error occurred while creating the task.");
//         }
//     };

//     const renderTasks = (tasks, priority) => (
//         <div>
//             <h3 className={`text-xl font-semibold ${
//                 priority === "high" ? "text-red-500" : priority === "medium" ? "text-yellow-500" : "text-green-500"
//             }`}>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</h3>

//             <ul className="mt-4">
//                 {tasks.length > 0 ? (
//                     tasks.map((task) => (
//                         <li key={task._id} className="p-4 border rounded mb-4">
//                             <h4 className="font-medium">{task.name}</h4>
//                             <p className="text-sm text-gray-600">{task.note}</p>
//                         </li>
//                     ))
//                 ) : (
//                     <p className="text-gray-500">No {priority} priority tasks available.</p>
//                 )}
//             </ul>
//         </div>
//     );

//     return (
//         <div className="priority-tasks">
//             <h2 className="text-2xl font-bold mt-6">Priority Tasks</h2>

//             {loading && <p className="text-blue-500 mt-4">Loading tasks...</p>}

//             {error && <p className="text-red-500 mt-4">{error}</p>}

//             <form onSubmit={handleTaskSubmit} className="task-form">
//                 <div>
//                     <label htmlFor="name">Task Name:</label>
//                     <input
//                         type="text"
//                         id="name"
//                         value={taskData.name}
//                         onChange={(e) =>
//                             setTaskData((prev) => ({ ...prev, name: e.target.value }))
//                         }
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="note">Note:</label>
//                     <textarea
//                         id="note"
//                         value={taskData.note}
//                         onChange={(e) =>
//                             setTaskData((prev) => ({ ...prev, note: e.target.value }))
//                         }
//                     />
//                 </div>
//                 <div>
//                     <label htmlFor="priority">Priority:</label>
//                     <select
//                         id="priority"
//                         value={taskData.priority}
//                         onChange={(e) =>
//                             setTaskData((prev) => ({ ...prev, priority: e.target.value }))
//                         }
//                     >
//                         <option value="high">High</option>
//                         <option value="medium">Medium</option>
//                         <option value="low">Low</option>
//                     </select>
//                 </div>
//                 <div>
//                     <label htmlFor="checklistType">Checklist Type:</label>
//                     <select
//                         id="checklistType"
//                         value={taskData.checklistType}
//                         onChange={(e) =>
//                             setTaskData((prev) => ({ ...prev, checklistType: e.target.value }))
//                         }
//                     >
//                         <option value="Morning">Morning</option>
//                         <option value="LateMorning">Late Morning</option>
//                         <option value="Afternoon">Afternoon</option>
//                         <option value="Evening">Evening</option>
//                         <option value="Night">Night</option>
//                     </select>
//                 </div>
//                 <button type="submit">Add Task</button>
//             </form>

//             <div className="mt-8">
//                 {renderTasks(priorityTasks.high, "high")}
//                 {renderTasks(priorityTasks.medium, "medium")}
//                 {renderTasks(priorityTasks.low, "low")}
//             </div>
//         </div>
//     );
// };

// export default PriorityTasks;



import React from "react";
import HighPriorityTasks from "./HighPriorityTasks";
import '../assets/css/login.css';
import MediumPriorityTasks from "./MediumPriorityTasks";
import LowPriorityTasks from "./LowPriorityTasks";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const PriorityTasks = ({checklistTypes}) => {
    const userId = localStorage.getItem("userId");
console.log(checklistTypes)
    return (
        <div className="priority-tasks">
            <h2 className="text-2xl font-bold mt-6 color-white">Priority Tasks</h2>

            <HighPriorityTasks backendUrl={backendUrl} userId={userId} />
            <MediumPriorityTasks backendUrl={backendUrl} userId={userId} />
            <LowPriorityTasks backendUrl={backendUrl} userId={userId} />
            {/* Add similar components for MediumPriorityTasks, LowPriorityTasks, etc. */}
        </div>
    );
};

export default PriorityTasks;
