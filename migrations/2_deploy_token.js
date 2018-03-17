var OneledgerToken = artifacts.require("OneledgerToken");
var TimeLock = artifacts.require("TimeLock");

module.exports = async (deployer) => {
  // deployment steps
  await deployer.deploy(OneledgerToken);
  await deployer.deploy(TimeLock,OneledgerToken.address);
};
