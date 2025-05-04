import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { Compass, Shield, Sword, Trophy } from "lucide-react";

function Onboarding({ walletAddress, signer, contract, setProfile, connectWallet }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initProfile = async () => {
      if (walletAddress && signer && contract) {
        setLoading(true);
        try {
          const xp = await contract.getXP(walletAddress);
          const level = await contract.getLevel(walletAddress);

          const profileData = {
            level: Number(level),
            xp: Number(xp),
            completedQuests: [],
            gridTheme: "basic-tent",
          };

          setProfile(profileData);
          setTimeout(() => {
            // navigate("/dashboard");
          }, 2000);
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

  const handleBeginQuest = async () => {
    if (walletAddress) {
      // Wallet is already connected, navigate to dashboard
      navigate("/dashboard");
    } else {
      // Wallet not connected, trigger connectWallet
      try {
        await connectWallet();
        // Note: connectWallet in App.jsx already handles navigation to /dashboard
        // upon successful connection, so no need to navigate here again
      } catch (error) {
        console.error("Error connecting wallet:", error);
        toast.error("Failed to connect wallet");
      }
    }
  };

  const features = [
    {
      icon: <Compass className="w-8 h-8 text-indigo-500" />,
      title: "Explore Quests",
      description: "Discover exciting challenges and adventures in the GridQuest world"
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: "Earn Rewards",
      description: "Complete quests to earn XP and level up your profile"
    },
    {
      icon: <Sword className="w-8 h-8 text-indigo-500" />,
      title: "Battle Challenges",
      description: "Face unique challenges and prove your worth"
    },
    {
      icon: <Trophy className="w-8 h-8 text-indigo-500" />,
      title: "Climb Leaderboards",
      description: "Compete with others and reach the top of the rankings"
    }
  ];

  if (walletAddress && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipLoader color="#4f46e5" size={40} className="mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            Welcome to GridQuest
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Embark on an epic journey through the blockchain realm. Complete quests, earn rewards, and become a legendary hero.
          </p>
          <div className="relative inline-flex group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <button
              onClick={handleBeginQuest}
              className="relative px-8 py-4 bg-black text-white rounded-lg leading-none flex items-center"
            >
              {walletAddress ? "Continue Your Quest" : "Begin Your Quest"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg
        lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-8 sm:p-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to join thousands of heroes in the GridQuest. Glory awaits!
            </p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Shield className="w-5 h-5 mr-2" />
                <span>Secure Blockchain</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Trophy className="w-5 h-5 mr-2" />
                <span>Daily Rewards</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Sword className="w-5 h-5 mr-2" />
                <span>Epic Challenges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;