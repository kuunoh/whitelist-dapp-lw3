const { ethers } = require('hardhat');

async function main() {
    /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so whitelistContract here is a factory for instances of our Whitelist contract.
  */
    const WhitelistContract = await ethers.getContractFactory('Whitelist');

    // Here we deploy the contract 
    const deployedWhitelistContract = await WhitelistContract.deploy(10);
    // 10 is the number of tokens to be whitelisted that we can find in the constructor

    // Wait for the deployment to be finished
    await deployedWhitelistContract.deployed();

    // print the address of the contract
    console.log(
        "Whitelisted contract address: ",
        deployedWhitelistContract.address
    );
}

// Call the main function and catch if there is any error 
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
    