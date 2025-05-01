import { useState } from "react";

const AddQuest = ({ contract, signer }) => {
  const [form, setForm] = useState({
    title: "",
    questType: "",
    xpReward: "",
    givesNFT: false,
  });

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
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Create New Quest
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Quest Title
          </label>
          <input
            id="title"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            type="text"
            name="title"
            placeholder="Enter quest title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label
            htmlFor="questType"
            className="block text-sm font-medium text-gray-700"
          >
            Quest Type
          </label>
          <select
            id="questType"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
            name="questType"
            value={form.questType}
            onChange={handleChange}
            required
          >
            <option value="">Select Quest Type</option>
            <option value="daily-login">Daily Login Reward</option>
            <option value="file-upload">File Upload</option>
            <option value="click-task">Click Task</option>
            <option value="video-task">Video Task (YouTube)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="xpReward"
            className="block text-sm font-medium text-gray-700"
          >
            XP Reward
          </label>
          <input
            id="xpReward"
            className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            type="number"
            name="xpReward"
            placeholder="Enter XP reward"
            value={form.xpReward}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            id="givesNFT"
            type="checkbox"
            name="givesNFT"
            checked={form.givesNFT}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="givesNFT"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Reward NFT?
          </label>
        </div>

        <button
          className="w-full bg-indigo-600 text-white py-3 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          type="submit"
        >
          Create Quest
        </button>
      </form>
    </div>
  );
};

export default AddQuest;