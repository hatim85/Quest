import { useState } from "react";

// const tasks = [
//   { id: "follow", label: "Follow a Twitter account", type: "action" },
//   { id: "post", label: "Make a post on X (Twitter)", type: "action" },
//   { id: "join-discord", label: "Join a Discord server", type: "action" },
//   { id: "like", label: "Like a specific Tweet", type: "action" },
//   { id: "quiz", label: "Answer Quiz", type: "quiz" },
//   { id: "upload", label: "Upload Screenshot", type: "upload" },
//   { id: "daily", label: "Daily Login", type: "wallet" },
// ];

export default function Tasks() {
  const [completed, setCompleted] = useState({});
  const [screenshot, setScreenshot] = useState(null);

  const handleComplete = (id) => {
    setCompleted({ ...completed, [id]: true });
  };

  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
      handleComplete("upload");
    }
  };

  return (
    // <div className="max-w-2xl mx-auto mt-10 space-y-4">
    //   {tasks.map((task) => (
    //     <div
    //       key={task.id}
    //       className="flex items-center justify-between border rounded-xl p-4 shadow-sm bg-white"
    //     >
    //       <div className="text-base">{task.label}</div>

    //       <div className="flex items-center gap-3">
    //         {task.type === "upload" ? (
    //           <div className="flex items-center gap-2">
    //             <input
    //               type="file"
    //               onChange={handleUpload}
    //               className="block text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    //             />
    //             {screenshot && <span className="text-green-500 text-sm">Uploaded</span>}
    //           </div>
    //         ) : task.type === "quiz" ? (
    //           <button
    //             onClick={() => handleComplete(task.id)}
    //             disabled={completed[task.id]}
    //             className={`px-3 py-1 text-sm font-medium rounded-md ${
    //               completed[task.id]
    //                 ? "bg-gray-300 cursor-not-allowed"
    //                 : "bg-blue-600 text-white hover:bg-blue-700"
    //             }`}
    //           >
    //             Take Quiz
    //           </button>
    //         ) : task.type === "wallet" ? (
    //           <button
    //             onClick={() => handleComplete(task.id)}
    //             disabled={completed[task.id]}
    //             className={`px-3 py-1 text-sm font-medium rounded-md ${
    //               completed[task.id]
    //                 ? "bg-gray-300 cursor-not-allowed"
    //                 : "bg-green-600 text-white hover:bg-green-700"
    //             }`}
    //           >
    //             Connect Wallet
    //           </button>
    //         ) : (
    //           <button
    //             onClick={() => handleComplete(task.id)}
    //             disabled={completed[task.id]}
    //             className={`px-3 py-1 text-sm font-medium rounded-md ${
    //               completed[task.id]
    //                 ? "bg-gray-300 cursor-not-allowed"
    //                 : "bg-purple-600 text-white hover:bg-purple-700"
    //             }`}
    //           >
    //             Complete
    //           </button>
    //         )}

    //         <input
    //           type="checkbox"
    //           checked={completed[task.id] || false}
    //           readOnly
    //           className="h-4 w-4 accent-green-600"
    //         />
    //       </div>
    //     </div>
    //   ))}
    // </div>
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <DailyLoginReward />
      <ClickTask taskId="follow-twitter" taskLabel="Follow a Twitter account" />
      <ClickTask taskId="post-twitter" taskLabel="Post on X (Twitter)" />
      <FileUpload onUploadComplete={(file) => console.log('File uploaded:', file)} />
      <VideoTask videoId="XI3wU47ynwY" taskId="watch-video" />
    </div>
  );
}
