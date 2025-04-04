"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, ChevronRight } from "lucide-react";

type Task = {
  title: string;
  url?: string;
  status: "todo" | "inprogress" | "done";
  subtasks: string[];
};

export default function ResearchPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [currentSubtask, setCurrentSubtask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const { push } = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const topicParam = decodeURIComponent(urlParams.get("topic") || "");
      setTopic(topicParam);

      if (!topicParam) {
        setError("No topic provided");
        setLoading(false);
        return;
      }

      const storedLecture = localStorage.getItem("lecture");
      if (storedLecture) {
        const lecture = JSON.parse(storedLecture);
        setTasks(lecture.research_tasks || []);
        setCurrentTask(lecture.research_tasks?.[0]?.title || null);
        setCurrentSubtask(lecture.research_tasks?.[0]?.subtasks?.[0] || null);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      fetch("http://localhost:8000/generate_simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicParam }),
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((lecture) => {
          if (!lecture?.title || !lecture?.slides) {
            throw new Error("Invalid lecture data received");
          }

          localStorage.setItem("lecture", JSON.stringify(lecture));
          setTasks(lecture.research_tasks || []);
          setCurrentTask(lecture.research_tasks?.[0]?.title || null);
          setCurrentSubtask(lecture.research_tasks?.[0]?.subtasks?.[0] || null);

          return fetch("http://localhost:8000/api/store_lecture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: topicParam,
              title: lecture.title,
              content: JSON.stringify(lecture.slides),
            }),
          });
        })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to store lecture");
          setTimeout(() => push("/lecture"), 1500);
        })
        .catch((error) => {
          console.error("Error:", error);
          setError(error.message);
        })
        .finally(() => setLoading(false));
    }
  }, [push]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
        const currentTaskIndex = updatedTasks.findIndex(
          (task) => task.title === currentTask
        );

        if (currentTaskIndex !== -1) {
          const currentTaskObj = updatedTasks[currentTaskIndex];
          const currentSubtaskIndex = currentTaskObj.subtasks.findIndex(
            (subtask) => subtask === currentSubtask
          );

          if (currentSubtaskIndex !== -1) {
            const nextSubtaskIndex =
              (currentSubtaskIndex + 1) % currentTaskObj.subtasks.length;
            setCurrentSubtask(currentTaskObj.subtasks[nextSubtaskIndex]);

            if (nextSubtaskIndex === 0) {
              const nextTaskIndex = (currentTaskIndex + 1) % updatedTasks.length;
              const nextTask = updatedTasks[nextTaskIndex];
              setCurrentTask(nextTask.title);
              setCurrentSubtask(nextTask.subtasks[0]);
            }
          } else {
            setCurrentSubtask(currentTaskObj.subtasks[0]);
          }
        }

        return updatedTasks;
      });
    }, Math.floor(Math.random() * 4000) + 2000);

    return () => clearInterval(interval);
  }, [currentTask, currentSubtask]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/10 to-blue-900/10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="h-12 w-12 text-purple-500" />
        </motion.div>
        <motion.h1 
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Researching {topic}...
        </motion.h1>
        <motion.p 
          className="mt-4 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Gathering the best resources for you
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/10 to-blue-900/10">
        <AlertCircle className="h-12 w-12 text-red-500 mb-6" />
        <h1 className="text-3xl font-bold text-red-500">Error</h1>
        <p className="mt-4 text-gray-300 max-w-md text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900/10 to-blue-900/10">
      <div className="container mx-auto p-8 md:p-20 flex flex-col md:flex-row gap-12">
        {/* Left Panel - Info */}
        <motion.div 
          className="md:w-[400px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Researching {topic}
          </motion.h1>
          
          <motion.h2 
            className="text-xl md:text-2xl mt-6 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Gathering information from a variety of sources to build a comprehensive interactive lecture.
          </motion.h2>

          {/* Current Activity Indicator */}
          <motion.div 
            className="mt-12 p-6 rounded-xl bg-gray-800/50 backdrop-blur-lg border border-gray-700/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-purple-400" />
              <h3 className="text-lg font-semibold text-purple-400">Current Activity</h3>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSubtask || "empty"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-300"
              >
                {currentSubtask || "Preparing research..."}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Right Panel - Tasks */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.ul className="space-y-6">
            {tasks.map((task, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  className={`flex items-center p-6 rounded-xl border-2 transition-all duration-300 overflow-hidden relative
                    ${
                      currentTask === task.title
                        ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50 shadow-lg shadow-purple-500/10"
                        : "bg-gray-800/50 border-gray-700/50 hover:border-purple-500/30"
                    }`}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Favicon */}
                  {task.url && (
                    <div className="relative w-10 h-10 mr-4 flex-shrink-0">
                      <Image
                        alt="Favicon"
                        src={`https://www.google.com/s2/favicons?domain=${task.url}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <motion.h3 
                      className={`text-xl font-bold truncate ${
                        currentTask === task.title ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {task.title}
                    </motion.h3>
                    {task.url && (
                      <motion.p className="text-sm text-gray-400 truncate">
                        {task.url.replace(/^https?:\/\/(www\.)?/, '')}
                      </motion.p>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="ml-4 flex items-center">
                    <ChevronRight className={`w-5 h-5 ${
                      currentTask === task.title ? "text-purple-300" : "text-gray-500"
                    }`} />
                  </div>

                  {/* Active Indicator */}
                  {currentTask === task.title && (
                    <motion.div 
                      className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-purple-400 to-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </motion.div>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </main>
  );
}