import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners"; // Added for loading spinner

function GridVisualization({ contract, signer }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false); // Track wallet connection

  // Define theme styles
  const themeStyles = {
    default: {
      backgroundColor: "bg-gray-200",
      completedColor: "bg-green-500",
      incompleteColor: "bg-gray-400",
      textColor: "text-black",
      border: "border-gray-600",
    },
    dark: {
      backgroundColor: "bg-gray-800",
      completedColor: "bg-green-700",
      incompleteColor: "bg-gray-600",
      textColor: "text-white",
      border: "border-gray-300",
    },
    vibrant: {
      backgroundColor: "bg-blue-200",
      completedColor: "bg-purple-500",
      incompleteColor: "bg-blue-300",
      textColor: "text-black",
      border: "border-purple-700",
    },
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (contract && signer) {
        try {
          const userAddress = await signer.getAddress();
          if (userAddress) {
            setIsWalletConnected(true);
            fetchProfileAndQuests();
          } else {
            setIsWalletConnected(false);
            setLoading(false);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
          setIsWalletConnected(false);
          setLoading(false);
        }
      } else {
        setIsWalletConnected(false);
        setLoading(false);
      }
    };

    const fetchProfileAndQuests = async () => {
      try {
        const userAddress = await signer.getAddress();

        // Fetch profile data
        const xp = await contract.getXP(userAddress);
        const level = await contract.getLevel(userAddress);
        console.log("XP:", xp, "Level:", level);
        const questCount = Number(await contract.questCount());
        const completedQuests = [];

        // Fetch quests and completion status
        const questList = [];
        for (let i = 0; i < questCount; i++) {
          const quest = await contract.quests(i);
          const hasCompleted = await contract.hasCompleted(userAddress, i);
          if (hasCompleted) {
            completedQuests.push(i);
          }
          questList.push({
            id: i,
            title: quest.title,
            questType: quest.questType,
            xpReward: Number(quest.xpReward),
            isActive: quest.isActive,
            givesNFT: quest.givesNFT,
            hasCompleted,
          });
        }

        // Set profile data
        setProfile({
          xp: Number(xp),
          level: Number(level),
          completedQuests,
          gridTheme: "default", // Placeholder, replace if stored elsewhere
        });

        setQuests(questList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile and quests:", error);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };

    checkWalletConnection();
  }, [contract, signer]);

  // Show wallet connection prompt if wallet is not connected
  if (!isWalletConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please connect your wallet.</p>
      </div>
    );
  }

  // Show loader while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader color="#3b82f6" size={50} />
      </div>
    );
  }

  // Get theme styles based on gridTheme
  const currentTheme = themeStyles[profile.gridTheme] || themeStyles.default;

  // Calculate grid dimensions (e.g., square grid based on quest count)
  const gridSize = Math.ceil(Math.sqrt(quests.length));
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, minmax(100px, 1fr))`,
    gap: "10px",
    padding: "10px",
  };

  return (
    <div className="container mx-auto p-4">
      {console.log("Profile:", profile)}
      <h1 className="text-3xl font-bold mb-4">Grid Visualization</h1>
      <div className="mb-4">
        <p>Level: {profile.level}</p>
        <p>XP: {profile.xp}</p>
        <p>Theme: {profile.gridTheme}</p>
        <p>Completed Quests: {profile.completedQuests.length}</p>
      </div>
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Back to Dashboard
      </button>
      <div className={`p-4 rounded ${currentTheme.backgroundColor}`}>
        <h2 className={`text-xl font-semibold mb-2 ${currentTheme.textColor}`}>
          Quest Grid
        </h2>
        <div style={gridStyle}>
          {quests.map((quest) => (
            <div
              key={quest.id}
              className={`p-2 rounded border ${currentTheme.border} ${
                quest.hasCompleted
                  ? currentTheme.completedColor
                  : currentTheme.incompleteColor
              } ${currentTheme.textColor} cursor-pointer hover:opacity-80`}
              onClick={() => toast.info(`Quest: ${quest.title}`)}
              title={`Quest: ${quest.title}\nXP: ${quest.xpReward}\nStatus: ${
                quest.hasCompleted ? "Completed" : "Incomplete"
              }`}
            >
              <p className="font-semibold truncate">{quest.title}</p>
              <p className="text-sm">XP: {quest.xpReward}</p>
              <p className="text-sm">
                {quest.hasCompleted ? "✅ Completed" : "⏳ Incomplete"}
              </p>
            </div>
          ))}
          {/* Fill remaining cells if grid is not square */}
          {Array.from({
            length: gridSize * gridSize - quests.length,
          }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className={`p-2 rounded border ${currentTheme.border} ${currentTheme.incompleteColor} opacity-50`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GridVisualization;