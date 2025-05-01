import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

function Onboarding({ walletAddress, signer, contract, setProfile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initProfile = async () => {
      if (walletAddress && signer && contract) {
        setLoading(true);
        try {
          const xp = await contract.getXP(walletAddress);
          const level = await contract.getLevel(walletAddress);

          // Remove localStorage to align with "clear on refresh" requirement
          const profileData = {
            level: Number(level),
            xp: Number(xp),
            completedQuests: [],
            gridTheme: "basic-tent",
          };

          setProfile(profileData);
          // Delay navigation to show onboarding UI briefly
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000); // 2-second delay to show the welcome message
        } catch (error) {
          console.error("Error initializing profile:", error);
          toast.error("Failed to load profile data");
        } finally {
          setLoading(false);
        }
      }
    };

    if (walletAddress && signer && contract) {
      initProfile();
    }
  }, [walletAddress, signer, contract, setProfile, navigate]);

  return (
    <div className="flex items-center justify-center min-h-full bg-transparent">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to QuestVerse!</h1>
        <p className="text-lg text-gray-600 mb-6">
          {walletAddress
            ? loading
              ? "Loading your profile..."
              : "Profile loaded, redirecting to dashboard..."
            : "Please connect your wallet to begin"}
        </p>
        {walletAddress && loading && (
          <ClipLoader color="#4f46e5" size={40} className="mx-auto" />
        )}
      </div>
    </div>
  );
}

export default Onboarding;