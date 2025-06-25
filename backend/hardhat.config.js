require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // mumbai: {
    //   url: "https://rpc-mumbai.maticvigil.com",
    //   accounts: ["YOUR_PRIVATE_KEY_HERE"]
    // }
  }
};
