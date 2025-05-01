const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy ERC721NFT contract
  const ERC721NFT = await ethers.getContractFactory("ERC721NFT");
  const erc721 = await ERC721NFT.deploy("GridQuest NFT", "GQNFT");
  await erc721.waitForDeployment();
  console.log("ERC721NFT deployed to:", erc721.target);

  // Deploy QuestManager contract
  const QuestManager = await ethers.getContractFactory("QuestManager");
  const universalProfileAddress = "0xBba320Afb3690192d10eA9664c2CA9F85b40dc58"; // Replace with actual Universal Profile if needed
  const questManager = await QuestManager.deploy(erc721.target, universalProfileAddress);
  await questManager.waitForDeployment();
  console.log("QuestManager deployed to:", questManager.target);

  // Set QuestManager as NFT contract's quest manager
  const tx = await erc721.setQuestManager(questManager.target);
  await tx.wait();
  console.log("QuestManager set as quest manager in ERC721NFT");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});