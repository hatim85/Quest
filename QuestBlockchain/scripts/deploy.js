const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy ERC721NFT contract
  const ERC721NFT = await ethers.getContractFactory("ERC721NFT");
  const erc721 = await ERC721NFT.deploy(
    "GridQuest NFT", // name
    "GQNFT"         // symbol
  );
  await erc721.waitForDeployment();
  console.log("ERC721NFT deployed to:", erc721.target);

  // Deploy QuestManager contract
  const QuestManager = await ethers.getContractFactory("QuestManager");
  const universalProfileAddress = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"; // Mock or real Universal Profile address
  const questManager = await QuestManager.deploy(
    erc721.target,                // ERC721NFT contract address
    universalProfileAddress,      // Universal Profile address
    30                           // count
  );
  await questManager.waitForDeployment();
  console.log("QuestManager deployed to:", questManager.target);

  // Set QuestManager as NFT contract's quest manager
  const tx = await erc721.setQuestManager(questManager.target);
  await tx.wait();
  console.log("QuestManager set as quest manager in ERC721NFT");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});