var OneledgerToken = artifacts.require("OneledgerToken");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(OneledgerToken);
};
