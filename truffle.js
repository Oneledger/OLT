var LedgerWalletProvider = require("truffle-ledger-provider");
var INFURA_APIKEY = "8OZLeTZ4sm6WyU2z6LwB"; // set your Infura API key
var ledgerOptions = {};

module.exports = {
  networks: {
    ganache: {
      host: "localhost",
      port: 8546,
      network_id: "*" // Match any network id
    },
    private: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 3000000
    },
    rinkeby: {
      provider: new LedgerWalletProvider(
                ledgerOptions,
                `https://rinkeby.infura.io/${INFURA_APIKEY}`
      ),
      network_id: 4,
      gas: 4600000
    },
    ropsten: {
      provider: new LedgerWalletProvider(ledgerOptions, `https://ropsten.infura.io/${INFURA_APIKEY}`),
      network_id: 3,
      gas: 4600000,
    }
  }
};
