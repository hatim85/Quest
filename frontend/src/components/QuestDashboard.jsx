import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import YouTubePlayer from "./YouTubePlayer";
import { ClipLoader } from "react-spinners";

function QuestDashboard({ contract, signer }) {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const videoIdMap = {
    0: "BXuM5sfuYsc"
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

        for (let i = 0; i < questCount; i++) {
          const hasCompleted = await contract.hasCompleted(userAddress, i);
          if (hasCompleted) {
            completedQuests.push(i);
          }
        }

        setProfile({
          xp: Number(xp),
          level: Number(level),
          completedQuests,
          gridTheme: "default",
        });

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
            videoId: "BB49x_uMlGA", // Fixed video for all video quests
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
      const hasCompleted = await contract.hasCompleted(userAddress, questId);
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, hasCompleted } : q))
      );
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Failed to complete quest");
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Quest Dashboard
        </h1>
        {profile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Level</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile.level}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">XP</p>
              <p className="text-lg font-semibold text-gray-900">{profile.xp}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => navigate("/grid")}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          View Quest Grid
        </button>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {quests.length === 0 ? (
            <p className="text-gray-600 col-span-full text-center">
              No quests available.
            </p>
          ) : quests.filter((quest) => !quest.hasCompleted).length === 0 ? (
            <p className="text-gray-600 col-span-full text-center">
              No active or incomplete quests available.
            </p>
          ) : (
            quests
              .filter((quest) => !quest.hasCompleted)
              .map((quest) => (
                <div
                key={quest.id}
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  {console.log("Quest Dashboard Quest:", quest)}
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {quest.title}
                  </h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {quest.questType.replace("-", " ").toUpperCase()}
                    </p>
                    <p>
                      <span className="font-medium">XP Reward:</span>{" "}
                      {quest.xpReward}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {quest.isActive ? "Active" : "Inactive"}
                    </p>
                    <p>
                      <span className="font-medium">NFT Reward:</span>{" "}
                      {quest.givesNFT ? "Yes" : "No"}
                    </p>
                  </div>
                  {!quest.isActive ? (
                    <p className="text-gray-500 mt-4 text-sm">
                      This quest is not currently active.
                    </p>
                  ) : (
                    <div className="mt-4">
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
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          Claim Daily Login Reward
                        </button>
                      ) : quest.questType === "file-upload" ? (
                        <input
                          type="file"
                          accept="*"
                          onChange={(e) => {
                            if (e.target.files.length > 0)
                              completeQuest(quest.id);
                          }}
                          className="mt-2 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:hover:bg-indigo-700 file:transition-colors"
                        />
                      ) : quest.questType === "click-task" ? (
                        <button
                          onClick={() => completeQuest(quest.id)}
                          className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          Click to Complete
                        </button>
                      ) : (
                        <p className="text-red-500 text-sm">
                          Unknown or misconfigured quest type.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestDashboard;