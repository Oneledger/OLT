var OneledgerToken = artifacts.require("OneledgerToken");
var OneledgerTokenVesting = artifacts.require("OneledgerTokenVesting");
var ICO = artifacts.require("ICO");

module.exports = async (deployer) => {
  // deployment steps
  await deployer.deploy(OneledgerToken);
  //await deployer.deploy(TimeLock,OneledgerToken.address);
};
