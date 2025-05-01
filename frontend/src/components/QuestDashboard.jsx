import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import YouTubePlayer from "./YouTubePlayer"; // Adjust path if needed
import { ClipLoader } from "react-spinners"; // Added for loading spinner

function QuestDashboard({ contract, signer }) {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [profile, setProfile] = useState(null); // Store profile data
  const [loading, setLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false); // Track wallet connection

  // Hardcoded videoId mapping (since not stored in contract)
  const videoIdMap = {
    0: "BXuM5sfuYsc", // Example: Map quest ID 0 to a YouTube video ID
    // Add more quest ID to videoId mappings as needed
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
        const questCount = Number(await contract.questCount());
        const completedQuests = [];

        // Fetch completed quests
        for (let i = 0; i < questCount; i++) {
          const hasCompleted = await contract.hasCompleted(userAddress, i);
          if (hasCompleted) {
            completedQuests.push(i);
          }
        }

        // Set profile data
        setProfile({
          xp: Number(xp),
          level: Number(level),
          completedQuests,
          gridTheme: "default", // Placeholder, replace if stored elsewhere
        });

        // Fetch quests
        const questList = [];
        for (let i = 0; i < questCount; i++) {
          const quest = await contract.quests(i);
          const hasCompleted = await contract.hasCompleted(userAddress, i);
          questList.push({
            id: i,
            title: quest.title,
            questType: quest.questType,
            xpReward: Number(quest.xpReward),
            isActive: quest.isActive,
            givesNFT: quest.givesNFT,
            hasCompleted,
            videoId: videoIdMap[i] || null, // Assign videoId if available
          });
        }

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

  const completeQuest = async (questId) => {
    if (!contract || !signer) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      const tx = await contract.completeQuest(questId);
      await tx.wait();
      toast.success("Quest completed!");

      // Update profile
      const userAddress = await signer.getAddress();
      const xp = await contract.getXP(userAddress);
      const level = await contract.getLevel(userAddress);
      const updatedProfile = {
        ...profile,
        xp: Number(xp),
        level: Number(level),
        completedQuests: [...profile.completedQuests, questId],
      };

      setProfile(updatedProfile);

      // Refresh quests
      const hasCompleted = await contract.hasCompleted(userAddress, questId);
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, hasCompleted } : q))
      );
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Failed to complete quest");
    }
  };

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

  // Main dashboard content
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Quest Dashboard</h1>
      {profile && (
        <p className="mb-4">
          Level: {profile.level} | XP: {profile.xp}
        </p>
      )}
      <button
        onClick={() => navigate("/grid")}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        View Grid
      </button>
      <div className="grid gap-4">
        {quests.length === 0 ? (
          <p>No quests available.</p>
        ) : (
          quests
            .filter((quest) => !quest.hasCompleted) // Filter out completed quests
            .map((quest) => (
              <div key={quest.id} className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-semibold">{quest.title}</h2>
                <p>Type: {quest.questType}</p>
                <p>XP Reward: {quest.xpReward}</p>
                <p>Status: {quest.isActive ? "Active" : "Inactive"}</p>
                <p>NFT Reward: {quest.givesNFT ? "Yes" : "No"}</p>

                {!quest.isActive ? (
                  <p className="text-gray-500 mt-2">This quest is not currently active.</p>
                ) : (
                  <>
                    {quest.questType === "video-task" && quest.videoId ? (
                      <>
                        {console.log("Quest Dashboard Video ID:", quest.videoId)}
                        <YouTubePlayer
                          videoId={quest.videoId}
                          onVideoEnd={() => completeQuest(quest.id)}
                        />
                      </>
                    ) : quest.questType === "daily-login" ? (
                      <button
                        onClick={() => completeQuest(quest.id)}
                        className="mt-2 p-2 bg-blue-500 text-white rounded"
                      >
                        Claim Daily Login Reward
                      </button>
                    ) : quest.questType === "file-upload" ? (
                      <input
                        type="file"
                        accept="*"
                        onChange={(e) => {
                          if (e.target.files.length > 0) completeQuest(quest.id);
                        }}
                        className="mt-2"
                      />
                    ) : quest.questType === "click-task" ? (
                      <button
                        onClick={() => completeQuest(quest.id)}
                        className="mt-2 p-2 bg-yellow-500 text-white rounded"
                      >
                        Click to Complete
                      </button>
                    ) : (
                      <p className="text-red-500">Unknown or misconfigured quest type.</p>
                    )}
                  </>
                )}
              </div>
            ))
        )}
        {quests.filter((quest) => !quest.hasCompleted).length === 0 && (
          <p>No active or incomplete quests available.</p>
        )}
      </div>
    </div>
  );
}

export default QuestDashboard;