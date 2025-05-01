import { useEffect, useRef, useState } from "react";

const YouTubePlayer = ({ videoId, onVideoEnd }) => {
  const iframeRef = useRef(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const loadPlayer = () => {
      if (window.YT && window.YT.Player) {
        const newPlayer = new window.YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                onVideoEnd();
              }
            },
          },
        });
        setPlayer(newPlayer);
      } else {
        setTimeout(loadPlayer, 500);
      }
    };

    loadPlayer();
  }, [onVideoEnd]);

  return (
    <div className="relative aspect-w-16 aspect-h-9 max-w-3xl mx-auto">
      {console.log("Video ID:", videoId)}
      <iframe
        ref={iframeRef}
        id="player"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        title="YouTube Video"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-full h-full rounded-lg shadow-md"
      ></iframe>
      <div className="absolute inset-0 rounded-lg ring-2 ring-indigo-200 ring-opacity-50 pointer-events-none" />
    </div>
  );
};

export default YouTubePlayer;