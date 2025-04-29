function QuestCard({ quest, isCompleted, onComplete }) {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
      <h3 className="text-xl font-bold mb-2">{quest.title}</h3>
      <p className="text-gray-500 text-sm">Type: {quest.type}</p>
      <p className="text-gray-500 text-sm mb-3">Reward: {quest.reward} XP</p>
      {isCompleted ? (
        <p className="text-green-600 font-semibold">Completed!</p>
      ) : (
        <button
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          onClick={onComplete}
        >
          Complete Quest
        </button>
      )}
    </div>
  );
}

export default QuestCard;