import { useState } from "react";
import { Sword, Trophy, Upload, Video, Calendar } from "lucide-react";

function AddQuest({ contract, signer }) {
  const [form, setForm] = useState({
    title: "",
    questType: "",
    xpReward: "",
    givesNFT: false,
  });

  const questTypes = [
    { id: "daily-login", label: "Daily Login Reward", icon: Calendar },
    { id: "file-upload", label: "File Upload", icon: Upload },
    { id: "click-task", label: "Click Task", icon: Sword },
    { id: "video-task", label: "Video Task (YouTube)", icon: Video },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.connect(signer).createQuest(
        form.title,
        form.questType,
        parseInt(form.xpReward),
        form.givesNFT,
      );
      await tx.wait();
      alert("Quest created successfully!");
      setForm({ title: "", questType: "", xpReward: "", givesNFT: false });
    } catch (err) {
      console.error("Error creating quest:", err);
      alert("Failed to create quest");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
        <div className="flex items-center justify-center mb-8">
          <Trophy className="w-10 h-10 text-indigo-600 mr-3" />
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Create New Quest
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-semibold text-gray-700">
              Quest Title
            </label>
            <input
              id="title"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white shadow-sm"
              type="text"
              name="title"
              placeholder="Enter an epic quest title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="questType" className="text-sm font-semibold text-gray-700">
              Quest Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {questTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label
                    key={type.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition duration-200 ${
                      form.questType === type.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="questType"
                      value={type.id}
                      checked={form.questType === type.id}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <Icon className="w-5 h-5 text-indigo-600 mr-3" />
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="xpReward" className="text-sm font-semibold text-gray-700">
              XP Reward
            </label>
            <div className="relative">
              <input
                id="xpReward"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white shadow-sm"
                type="number"
                name="xpReward"
                placeholder="Enter XP amount"
                value={form.xpReward}
                onChange={handleChange}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500">XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-white p-4 rounded-lg border border-gray-200">
            <input
              id="givesNFT"
              type="checkbox"
              name="givesNFT"
              checked={form.givesNFT}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="givesNFT" className="ml-3 text-sm font-medium text-gray-700">
              Include NFT Reward
            </label>
          </div>

          <button
            className="w-full relative group overflow-hidden px-6 py-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition duration-200"
            type="submit"
          >
            <span className="relative z-10">Create Epic Quest</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddQuest;