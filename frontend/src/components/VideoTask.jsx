import { useState, useEffect, useRef } from "react";

const VideoTask = ({ videoId, taskId, onComplete }) => {
  const [completed, setCompleted] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    const taskCompleted = localStorage.getItem(taskId);
    if (taskCompleted) setCompleted(true);
  }, [taskId]);

  useEffect(() => {
    const checkYT = () => {
      if (window.YT && window.YT.Player) {
        new window.YT.Player(iframeRef.current, {
          events: {
            onStateChange: function (event) {
              if (event.data === window.YT.PlayerState.ENDED) {
                handleCompletion();
              }
            },
          },
        });
      } else {
        setTimeout(checkYT, 500);
      }
    };
    checkYT();
  }, []);

  const handleCompletion = () => {
    if (!completed) {
      localStorage.setItem(taskId, "true");
      setCompleted(true);
      onComplete(); // Call parent completion
    }
  };

  return (
    <div className="mt-2 border p-4 rounded-lg bg-gray-50">
      <p className="mb-2 font-medium">Watch this video to complete the quest:</p>
      <div className="aspect-w-16 aspect-h-9 mb-2">
        <iframe
          ref={iframeRef}
          id={`player-${taskId}`}
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
          title="Video Quest"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      </div>
      {completed && (
        <p className="text-green-600 font-semibold">Video watched! Quest completed.</p>
      )}
    </div>
  );
};

export default VideoTask;
