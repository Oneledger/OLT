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
    }
  }
};
