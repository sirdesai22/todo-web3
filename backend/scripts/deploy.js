const hre = require("hardhat");

async function main() {
  const Todo = await hre.ethers.getContractFactory("Todo");
  const todo = await Todo.deploy();

  // Wait for deployment to finish
  await todo.waitForDeployment();

  console.log("Todo contract deployed to:", await todo.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
