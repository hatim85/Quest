import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Onboarding({ walletAddress, signer, contract, setProfile }) {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("walletAddress: ", walletAddress);
    const initProfile = async () => {
      if (walletAddress && signer && contract) {
        try {
          // Fetch XP and level from the contract
          const xp = await contract.getXP(walletAddress);
          const level = await contract.getLevel(walletAddress);

          // Load or initialize profile
          const profileData = JSON.parse(localStorage.getItem(walletAddress)) || {
            level: Number(level),
            xp: Number(xp),
            completedQuests: [],
            gridTheme: "basic-tent",
          };

          // Update profile if contract data differs
          profileData.level = Number(level);
          profileData.xp = Number(xp);

          localStorage.setItem(walletAddress, JSON.stringify(profileData));
          setProfile(profileData);
          navigate("/dashboard");
        } catch (error) {
          console.error("Error initializing profile:", error);
          toast.error("Failed to load profile data");
        }
      }
    };

    initProfile();
  }, [walletAddress, signer, contract, setProfile, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to GridQuest!</h1>
        {console.log("Wallet Address: ", walletAddress)}
        <p className="text-lg text-gray-700">
          {walletAddress ? "Loading profile..." : "Please connect your wallet"}
        </p>
      </div>
    </div>
  );
}

export default Onboarding;