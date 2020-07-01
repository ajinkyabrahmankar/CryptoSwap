const CryptoSwap = artifacts.require("CryptoSwap");
const Token = artifacts.require("Token");

module.exports = async function (deployer) {
    // Deploy Token
    await deployer.deploy(Token);
    const token = await Token.deployed()
    
    // Deploy CryptoSwap
    await deployer.deploy(CryptoSwap, token.address);
    const cryptoSwap = await CryptoSwap.deployed()

    //Transfer all tokens to CryptoSwap (1 million)
    await token.transfer(cryptoSwap.address, '1000000000000000000000000')
};
