import { useState, useEffect } from "react";

const DailyLoginReward = () => {
  const [rewardGiven, setRewardGiven] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(10); // Customize the reward amount

  useEffect(() => {
    const lastLoginDate = localStorage.getItem("lastLoginDate");
    const currentDate = new Date().toLocaleDateString();

    if (lastLoginDate !== currentDate) {
      localStorage.setItem("lastLoginDate", currentDate);
      setRewardGiven(false); // User hasn't logged in today yet
    } else {
      setRewardGiven(true); // User already logged in today
    }
  }, []);

  const handleLogin = () => {
    if (!rewardGiven) {
      // Give reward to user
      setRewardGiven(true);
      alert(`You've earned ${rewardAmount} points for today's login!`);
    } else {
      alert("You have already received today's reward!");
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <h3 className="font-semibold text-lg">Daily Login Rewards</h3>
      <p>Earn {rewardAmount} points for logging in today!</p>
      <button
        onClick={handleLogin}
        className={`px-4 py-2 rounded-lg ${rewardGiven ? "bg-gray-300" : "bg-blue-600 text-white"} mt-2`}
        disabled={rewardGiven}
      >
        {rewardGiven ? "Already Logged In" : "Claim Reward"}
      </button>
    </div>
  );
};

export default DailyLoginReward;