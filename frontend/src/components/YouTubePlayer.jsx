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
        setTimeout(loadPlayer, 500); // Retry until API is ready
      }
    };

    loadPlayer();
  }, []);

  return (
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        ref={iframeRef}
        id="player"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        title="YouTube Video"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-full h-full rounded"
      ></iframe>
    </div>
  );
};

export default YouTubePlayer;
