require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    luksoTestnet: {
      url: process.env.VITE_LUKSO_RPC_URL,
      accounts: [process.env.VITE_CONTROLLER_PRIVATE_KEY],
      chainId: 4201,
    },
    // hardhat:{
    //   accounts: [process.env.HARDHAT_PRIVATE_KEY],
    //   chainId: 1337,
    // }
  },
};
