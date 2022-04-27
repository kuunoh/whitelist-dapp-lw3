//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist { 

    // Max contract of whitelisted addresses allowed 
    uint8 public maxWhitelistAddresses;

    // Creating a mapping of whitelister addresses 
    // If an address i whitelisted, then the value of the mapping is true, false by defautt
    mapping (address => bool) public whitelistedAddresses;

    // NumAddressesWhitelisted would be used to keep track of how many addresses are whitelisted
    uint8 public numAddressesWhitelisted;

    // Setting the max number of addresses that can be whitelisted
    // User will put the value at the time of deployment 
    constructor(uint8 _maxWhitelistAddresses) {
        maxWhitelistAddresses = _maxWhitelistAddresses;
    }

    /**
    addAddressToWhitelist - This function adds the address of the sender to the whitelist
     */
     function addAddressToWhitelist() public {
         // Check if user has already been whitelisted
         require(!whitelistedAddresses[msg.sender], "You are already whitelisted");
         // Check if the numAddressWhitelisted is less than the max number of addresses allowed
         require(numAddressesWhitelisted < maxWhitelistAddresses, "You have reached the max number of whitelisted addresses");
         // Add the address to the whitelist
         whitelistedAddresses[msg.sender] = true;
         // Increase the number of whitelisted addresses
         numAddressesWhitelisted += 1;
     }
}