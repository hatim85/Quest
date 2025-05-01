import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

function GridVisualization({ contract, signer }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Define theme styles
  const themeStyles = {
    default: {
      backgroundColor: "bg-gray-100",
      completedColor: "bg-green-500",
      incompleteColor: "bg-gray-300",
      textColor: "text-gray-900",
      border: "border-gray-400",
    },
    dark: {
      backgroundColor: "bg-gray-800",
      completedColor: "bg-green-600",
      incompleteColor: "bg-gray-600",
      textColor: "text-white",
      border: "border-gray-200",
    },
    vibrant: {
      backgroundColor: "bg-indigo-100",
      completedColor: "bg-purple-500",
      incompleteColor: "bg-indigo-200",
      textColor: "text-gray-900",
      border: "border-purple-600",
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
        const xp = await contract.getXP(userAddress);
        const level = await contract.getLevel(userAddress);
        const questCount = Number(await contract.questCount());
        const completedQuests = [];
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

        setProfile({
          xp: Number(xp),
          level: Number(level),
          completedQuests,
          gridTheme: "default",
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

  if (!isWalletConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-lg font-medium text-gray-700">
            Please connect your wallet to view quests.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <ClipLoader color="#4f46e5" size={60} />
      </div>
    );
  }

  const currentTheme = themeStyles[profile.gridTheme] || themeStyles.default;

  const gridSize = Math.ceil(Math.sqrt(quests.length));
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridSize}, minmax(120px, 1fr))`,
    gap: "16px",
    padding: "16px",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Quest Grid Visualization
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Level</p>
            <p className="text-lg font-semibold text-gray-900">{profile.level}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">XP</p>
            <p className="text-lg font-semibold text-gray-900">{profile.xp}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Theme</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {profile.gridTheme}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Completed Quests</p>
            <p className="text-lg font-semibold text-gray-900">
              {profile.completedQuests.length}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Back to Dashboard
        </button>
        <div className={`p-6 rounded-xl ${currentTheme.backgroundColor}`}>
          <h2 className={`text-xl font-semibold mb-4 ${currentTheme.textColor}`}>
            Quest Grid
          </h2>
          <div style={gridStyle}>
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-4 rounded-lg border ${currentTheme.border} ${
                  quest.hasCompleted
                    ? currentTheme.completedColor
                    : currentTheme.incompleteColor
                } ${currentTheme.textColor} cursor-pointer hover:shadow-md transition-shadow duration-200`}
                onClick={() => toast.info(`Quest: ${quest.title}`)}
                title={`Quest: ${quest.title}\nXP: ${quest.xpReward}\nStatus: ${
                  quest.hasCompleted ? "Completed" : "Incomplete"
                }`}
              >
                <p className="font-semibold truncate text-sm">{quest.title}</p>
                <p className="text-xs mt-1">XP: {quest.xpReward}</p>
                <p className="text-xs mt-1">
                  {quest.hasCompleted ? "✅ Completed" : "⏳ Incomplete"}
                </p>
              </div>
            ))}
            {Array.from({
              length: gridSize * gridSize - quests.length,
            }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={`p-4 rounded-lg border ${currentTheme.border} ${currentTheme.incompleteColor} opacity-50`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GridVisualization;