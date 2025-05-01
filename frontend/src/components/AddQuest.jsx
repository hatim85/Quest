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
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Create New Quest</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          type="text"
          name="title"
          placeholder="Quest Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <select
          className="w-full border p-2 rounded"
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

        <input
          className="w-full border p-2 rounded"
          type="number"
          name="xpReward"
          placeholder="XP Reward"
          value={form.xpReward}
          onChange={handleChange}
          required
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="givesNFT"
            checked={form.givesNFT}
            onChange={handleChange}
          />
          <span>Reward NFT?</span>
        </label>

        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          type="submit"
        >
          Create Quest
        </button>
      </form>
    </div>
  );
};

export default AddQuest;