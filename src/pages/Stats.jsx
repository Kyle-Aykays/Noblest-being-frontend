import React, { useEffect, useState, useRef } from "react";
import { Chart, registerables } from "chart.js";
import Navbar from "../components/Navbar";
import "../assets/css/login.css";
import "../assets/css/stats.css";
import "../output.css";

Chart.register(...registerables);

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const checklistTypes = ["All", "Morning", "LateMorning", "Afternoon", "Evening", "Night"];

const Stats = () => {
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const completionChartRef = useRef(null);
  const priorityChartRef = useRef(null);
  const completionChartInstance = useRef(null);
  const priorityChartInstance = useRef(null);

  const userId = localStorage.getItem("userId");

  const fetchCombinedReport = async () => {
    const userId = localStorage.getItem("userId");
    // console.log ("I am userID:"= userId+ " I am date: "+ selected)
    if (!userId || !selectedDate) {
        setError("User ID and date are required.");
        return;
    }

    try {
        // Reformat the date to YYYY-MM-DD
        const formattedDate = new Date(selectedDate).toISOString().split("T")[0];

        const response = await fetch(`${backendUrl}/report/getCombinedReport`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId, date: formattedDate }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setStatsData(result.data);
        } else {
            throw new Error(result.message || "Failed to fetch combined report");
        }
    } catch (err) {
        setError(err.message);
        console.error(err);
    }
};



  const fetchReportByDate = async () => {
    try {
      const response = await fetch(`${backendUrl}/report/getReportByDate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, checklistType: selectedChecklist, date: selectedDate }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "No reports available for the selected date.");
      }

      setStatsData(result.data);
    } catch (err) {
      setError(err.message);
      setStatsData(null);
    }
  };

  const generateOrUpdateReport = async () => {
    try {
      const response = await fetch(`${backendUrl}/report/generateReport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, checklistType: selectedChecklist }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to generate or update report.");
      }
    } catch (err) {
      setError(err.message);
      throw err; // Prevent subsequent calls if report generation fails
    }
  };

  const validateDate = (date) => {
    const today = new Date().toISOString().split("T")[0];
    return date <= today;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        if (!validateDate(selectedDate)) {
          setError("Selected date is in the future. Please choose a valid date.");
          setStatsData(null);
          setLoading(false);
          return;
        }

        if (selectedChecklist === "All") {
          await fetchCombinedReport(selectedDate);
        } else if (selectedDate === new Date().toISOString().split("T")[0]) {
          await generateOrUpdateReport();
          await fetchReportByDate();
        } else {
          await fetchReportByDate();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedChecklist, selectedDate]);

  useEffect(() => {
    if (statsData) {
      renderCharts();
    }
  }, [statsData]);

  const renderCharts = () => {
    const { completedTasks, pendingTasks, priorityStats } = statsData;

    const completedPriorityStats = {
      high: priorityStats.high.completed,
      medium: priorityStats.medium.completed,
      low: priorityStats.low.completed,
    };

    const maxPriority = Math.max(
      completedPriorityStats.high,
      completedPriorityStats.medium,
      completedPriorityStats.low,
      1
    );

    if (completionChartInstance.current) {
      completionChartInstance.current.destroy();
    }

    if (priorityChartInstance.current) {
      priorityChartInstance.current.destroy();
    }

    completionChartInstance.current = new Chart(completionChartRef.current, {
      type: "doughnut",
      data: {
        labels: ["Completed Tasks", "Pending Tasks"],
        datasets: [
          {
            data: [completedTasks, pendingTasks],
            backgroundColor: ["#4CAF50", "#FFC107"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Completion Percentage: ${statsData.completionPercentage}%`,
          },
        },
      },
    });

    priorityChartInstance.current = new Chart(priorityChartRef.current, {
      type: "bar",
      data: {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            label: "Priority Tasks",
            data: [
              completedPriorityStats.high,
              completedPriorityStats.medium,
              completedPriorityStats.low,
            ],
            backgroundColor: ["#EF4444", "#FFC300", "#22C55E"],
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: maxPriority + 1,
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Priority Distribution (Completed Tasks)",
          },
          legend: {
            display: false,
          },
        },
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="stats-page p-6">
        <h1 className="text-3xl font-bold mb-4 px-4 text-white">Stats Overview</h1>
        <div className="filters mb-4">
          <div>
            <label className="mr-2 text-white">Checklist:</label>
            <select
              value={selectedChecklist}
              onChange={(e) => setSelectedChecklist(e.target.value)}
              className="p-2 border rounded"
            >
              {checklistTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="ml-4 mr-2 px-4 text-white">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded background-transparenet text-white"
            />
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p className="text-white">Loading stats...</p>
        ) : statsData ? (
          <div>
            <p className="text-white mb-4 px-4">
 Report for {selectedChecklist === "All" ? "All Checklists" : `${statsData.date}`} -{" "}
            {selectedChecklist}              </p>
            <div className="charts-container grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="chart-wrapper">
                <canvas ref={completionChartRef}></canvas>
              </div>
              <div className="chart-wrapper">
                <canvas ref={priorityChartRef}></canvas>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No data available.</p>
        )}
      </div>
    </>
  );
};

export default Stats;
