const ClickTask = ({ taskId, taskLabel }) => {
    const [completed, setCompleted] = useState(false);
  
    const handleClickTask = () => {
      setCompleted(true);
      localStorage.setItem(taskId, true);
    };
  
    useEffect(() => {
      const isTaskCompleted = localStorage.getItem(taskId);
      if (isTaskCompleted) setCompleted(true);
    }, [taskId]);
  
    return (
      <div className="border p-4 rounded-lg">
        <p>{taskLabel}</p>
        <button
          onClick={handleClickTask}
          className={`px-4 py-2 rounded-lg ${completed ? "bg-gray-300" : "bg-green-500 text-white"}`}
          disabled={completed}
        >
          {completed ? "Task Completed" : "Click to Complete Task"}
        </button>
      </div>
    );
  };
  

export default ClickTask;