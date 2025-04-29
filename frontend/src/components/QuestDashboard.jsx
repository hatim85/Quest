import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import YouTubePlayer from "./YouTubePlayer"; // Adjust path if needed

function QuestDashboard({ contract, signer, profile, setProfile }) {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      if (contract && signer && profile) {
        try {
          const questCount = Number(await contract.questCount());
          const questList = [];

          for (let i = 0; i < questCount; i++) {
            const quest = await contract.quests(i);
            const hasCompleted = await contract.hasCompleted(
              await signer.getAddress(),
              i
            );
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

          setQuests(questList);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching quests:", error);
          toast.error("Failed to load quests");
          setLoading(false);
        }
      }
    };

    fetchQuests();
  }, [contract, signer, profile]);

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
      const xp = await contract.getXP(await signer.getAddress());
      const level = await contract.getLevel(await signer.getAddress());
      const updatedProfile = {
        ...profile,
        xp: Number(xp),
        level: Number(level),
        completedQuests: [...profile.completedQuests, questId],
      };

      localStorage.setItem(await signer.getAddress(), JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      // Refresh quests
      const hasCompleted = await contract.hasCompleted(await signer.getAddress(), questId);
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, hasCompleted } : q
        )
      );
    } catch (error) {
      console.error("Error completing quest:", error);
      toast.error("Failed to complete quest");
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please connect your wallet and complete onboarding.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Quest Dashboard</h1>
      <p className="mb-4">
        Level: {profile.level} | XP: {profile.xp}
      </p>
      <button
        onClick={() => navigate("/grid")}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        View Grid
      </button>
      {loading ? (
        <p>Loading quests...</p>
      ) : (
        <div className="grid gap-4">
          {quests.length === 0 ? (
            <p>No quests available.</p>
          ) : (
            quests.map((quest) => (
              <div
                key={quest.id}
                className="p-4 bg-white rounded shadow"
              >
                <h2 className="text-xl font-semibold">{quest.title}</h2>
                <p>Type: {quest.questType}</p>
                <p>XP Reward: {quest.xpReward}</p>
                <p>Status: {quest.isActive ? "Active" : "Inactive"}</p>
                <p>NFT Reward: {quest.givesNFT ? "Yes" : "No"}</p>
                {quest.questType === "Video" ? (
                  <YouTubePlayer
                    videoId={quest.videoId}
                    onVideoEnd={() => completeQuest(quest.id)}
                  />
                ) : (
                  <button
                    onClick={() => completeQuest(quest.id)}
                    disabled={!quest.isActive}
                    className={`mt-2 p-2 ${quest.isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"
                      } text-white rounded`}
                  >
                    Complete Quest
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default QuestDashboard;