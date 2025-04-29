import { useNavigate } from "react-router-dom";

function GridVisualization({ profile }) {
  const navigate = useNavigate();

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please connect your wallet and complete onboarding.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Grid Visualization</h1>
      <p>Level: {profile.level}</p>
      <p>XP: {profile.xp}</p>
      <p>Theme: {profile.gridTheme}</p>
      <p>Completed Quests: {profile.completedQuests.length}</p>
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Back to Dashboard
      </button>
      <div className="mt-4 p-4 bg-gray-200 rounded">
        <p>Grid visualization placeholder (theme: {profile.gridTheme})</p>
      </div>
    </div>
  );
}

export default GridVisualization;