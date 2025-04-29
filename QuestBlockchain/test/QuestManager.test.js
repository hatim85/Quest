const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("QuestManager and LSP8NFT", function () {
  let QuestManager, LSP8NFT, MockERC725Y;
  let questManager, lsp8NFT, mockERC725Y;
  let owner, admin, player1, player2;
  let mockERC725YSigner, rewardTokenId;

  beforeEach(async function () {
    [owner, admin, player1, player2] = await ethers.getSigners();
    console.log("Owner address:", owner.address);
    console.log("Admin address:", admin.address);

    // Deploy MockERC725Y contract
    MockERC725Y = await ethers.getContractFactory("MockERC725Y");
    mockERC725Y = await MockERC725Y.deploy();
    await mockERC725Y.waitForDeployment();
    console.log("MockERC725Y deployed at:", mockERC725Y.target);

    // Impersonate mockERC725Y address
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [mockERC725Y.target],
    });
    mockERC725YSigner = await ethers.getSigner(mockERC725Y.target);
    console.log("mockERC725YSigner address:", mockERC725YSigner.address);

    // Fund mockERC725Y for gas
    await owner.sendTransaction({
      to: mockERC725Y.target,
      value: ethers.parseEther("1.0"),
    });

    // Deploy LSP8NFT contract
    LSP8NFT = await ethers.getContractFactory("LSP8NFT");
    lsp8NFT = await LSP8NFT.deploy(
      "QuestNFT",
      "QNFT",
      owner.address,
      0, // lsp8TokenIdType
      1 // isNFT
    );
    await lsp8NFT.waitForDeployment();
    console.log("LSP8NFT deployed at:", lsp8NFT.target);

    // Deploy QuestManager contract
    QuestManager = await ethers.getContractFactory("QuestManager");
    questManager = await QuestManager.deploy(
      lsp8NFT.target,
      mockERC725Y.target,
      11
    );
    await questManager.waitForDeployment();
    console.log("QuestManager deployed at:", questManager.target);

    // Set QuestManager as authorized minter
    await lsp8NFT.connect(owner).setQuestManager(questManager.target);
    console.log("QuestManager set as minter for LSP8NFT");

    // Sample tokenId for testing
    rewardTokenId = ethers.encodeBytes32String("TEST_TOKEN_1");
  });

  afterEach(async function () {
    // Stop impersonating mockERC725Y
    await hre.network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [mockERC725Y.target],
    });
  });

  describe("QuestManager Deployment", function () {
    it("should set correct initial values", async function () {
      expect(await questManager.admin()).to.equal(mockERC725Y.target);
      expect(await questManager.rewardNFTContract()).to.equal(lsp8NFT.target);
      expect(await questManager.universalProfile()).to.equal(mockERC725Y.target);
      expect(await questManager.count()).to.equal(11);
      expect(await questManager.questCount()).to.equal(0);
    });
  });

  describe("Quest Creation", function () {
    it("should allow admin to create a quest", async function () {
      await expect(
        questManager
          .connect(mockERC725YSigner)
          .createQuest("Test Quest", "Daily", 100, true, rewardTokenId)
      )
        .to.emit(questManager, "QuestCreated")
        .withArgs(0, "Test Quest", 100);

      const quest = await questManager.quests(0);
      expect(quest.title).to.equal("Test Quest");
      expect(quest.questType).to.equal("Daily");
      expect(quest.xpReward).to.equal(100);
      expect(quest.isActive).to.be.true;
      expect(quest.givesNFT).to.be.true;
      expect(quest.rewardTokenId).to.equal(rewardTokenId);
      expect(await questManager.questCount()).to.equal(1);
    });

    it("should revert if non-admin tries to create quest", async function () {
      await expect(
        questManager
          .connect(player1)
          .createQuest("Test Quest", "Daily", 100, true, rewardTokenId)
      ).to.be.revertedWith("Not admin");
    });

    it("should revert if XP reward is zero", async function () {
      await expect(
        questManager
          .connect(mockERC725YSigner)
          .createQuest("Test Quest", "Daily", 0, true, rewardTokenId)
      ).to.be.revertedWith("XP reward must be positive");
    });
  });

  describe("Quest Completion", function () {
    beforeEach(async function () {
      // Create a test quest
      await questManager
        .connect(mockERC725YSigner)
        .createQuest("Test Quest", "Daily", 100, true, rewardTokenId);
    });

    it("should allow player to complete a quest and receive XP and NFT", async function () {
      await expect(questManager.connect(player1).completeQuest(0))
        .to.emit(questManager, "QuestCompleted")
        .withArgs(player1.address, 0, 100)
        .to.emit(questManager, "XPUpdated")
        .withArgs(player1.address, 100)
        .to.emit(questManager, "LevelUp")
        .withArgs(player1.address, 2);

      expect(await questManager.getXP(player1.address)).to.equal(100);
      expect(await questManager.getLevel(player1.address)).to.equal(2);
      expect(await questManager.hasCompleted(player1.address, 0)).to.be.true;
      expect(await lsp8NFT.balanceOf(player1.address)).to.equal(1);
    });

    it("should revert if quest ID is invalid", async function () {
      await expect(
        questManager.connect(player1).completeQuest(999)
      ).to.be.revertedWith("Invalid quest ID");
    });

    it("should revert if quest already completed", async function () {
      await questManager.connect(player1).completeQuest(0);
      await expect(
        questManager.connect(player1).completeQuest(0)
      ).to.be.revertedWith("Already completed");
    });
  });

  describe("Metadata Updates", function () {
    beforeEach(async function () {
      await questManager
        .connect(mockERC725YSigner)
        .createQuest("Test Quest", "Daily", 100, true, rewardTokenId);
    });

    it("should update metadata on quest completion", async function () {
      await expect(questManager.connect(player1).completeQuest(0))
        .to.emit(questManager, "MetadataUpdated")
        .withArgs(player1.address, 2, 100);
    });
  });

  describe("Admin Functions", function () {
    it("should allow admin to change NFT contract", async function () {
      const newNFTContract = ethers.Wallet.createRandom().address;
      await questManager.connect(mockERC725YSigner).setNFTContract(newNFTContract);
      expect(await questManager.rewardNFTContract()).to.equal(newNFTContract);
    });

    it("should allow admin to change universal profile", async function () {
      const newUP = ethers.Wallet.createRandom().address;
      await questManager.connect(mockERC725YSigner).setUniversalProfile(newUP);
      expect(await questManager.universalProfile()).to.equal(newUP);
    });

    it("should allow admin to change admin", async function () {
      await expect(questManager.connect(mockERC725YSigner).changeAdmin(player1.address))
        .to.emit(questManager, "AdminChanged")
        .withArgs(mockERC725Y.target, player1.address);
      expect(await questManager.admin()).to.equal(player1.address);
    });

    it("should revert if non-admin tries to change admin", async function () {
      await expect(
        questManager.connect(player1).changeAdmin(player2.address)
      ).to.be.revertedWith("Not admin");
    });
  });

  describe("LSP8NFT", function () {
    it("should set correct initial values", async function () {
      expect(await lsp8NFT.owner()).to.equal(owner.address);
      expect(await lsp8NFT.questManager()).to.equal(questManager.target);
      // Access name and symbol via getData with LSP4 metadata keys
      const nameKey = ethers.keccak256(ethers.toUtf8Bytes("LSP4TokenName"));
      const symbolKey = ethers.keccak256(ethers.toUtf8Bytes("LSP4TokenSymbol"));
      const nameData = await lsp8NFT.getData(nameKey);
      const symbolData = await lsp8NFT.getData(symbolKey);
      console.log("Name data:", nameData);
      console.log("Symbol data:", symbolData);
      expect(ethers.toUtf8String(nameData)).to.equal("QuestNFT");
      expect(ethers.toUtf8String(symbolData)).to.equal("QNFT");
    });

    it("should allow owner to set new quest manager", async function () {
      const newQuestManager = ethers.Wallet.createRandom().address;
      await lsp8NFT.connect(owner).setQuestManager(newQuestManager);
      expect(await lsp8NFT.questManager()).to.equal(newQuestManager);
    });

    it("should revert if non-owner tries to set quest manager", async function () {
      await expect(
        lsp8NFT.connect(player1).setQuestManager(player2.address)
      ).to.be.revertedWith("Only owner can set quest manager");
    });

    it("should allow quest manager to mint NFT", async function () {
      await questManager
        .connect(mockERC725YSigner)
        .createQuest("Test Quest", "Daily", 100, true, rewardTokenId);
      await questManager.connect(player1).completeQuest(0);
      expect(await lsp8NFT.balanceOf(player1.address)).to.equal(1);
    });
  });

  describe("Edge Cases", function () {
    it("should handle multiple quests correctly", async function () {
      await questManager
        .connect(mockERC725YSigner)
        .createQuest("Quest 1", "Daily", 100, true, rewardTokenId);
      await questManager
        .connect(mockERC725YSigner)
        .createQuest(
          "Quest 2",
          "Weekly",
          200,
          false,
          ethers.encodeBytes32String("TEST_TOKEN_2")
        );

      await questManager.connect(player1).completeQuest(0);
      await questManager.connect(player1).completeQuest(1);

      expect(await questManager.getXP(player1.address)).to.equal(300);
      expect(await questManager.getLevel(player1.address)).to.equal(3);
      expect(await lsp8NFT.balanceOf(player1.address)).to.equal(1);
    });

    it("should handle level progression correctly", async function () {
      await questManager
        .connect(mockERC725YSigner)
        .createQuest("High XP Quest", "Special", 600, false, rewardTokenId);

      await questManager.connect(player1).completeQuest(0);
      expect(await questManager.getLevel(player1.address)).to.equal(4);
    });
  });
});