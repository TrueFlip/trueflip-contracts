module.exports = {
    build: {
      "constants.js": [
        "migrations/constants.js"
      ],
    },
    rpc: {
        host: "localhost",
        port: 8545
    },
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*"
        },
        testnet: {
            host: "localhost",
            port: 8545,
            network_id: 3,
            gas: 2000000
        },
        live: {
            host: "localhost",
            port: 8545,
            network_id: 1,  // Ethereum public network
            gas: 4000000,
            gasPrice: 20000000000
        },
        kovan : {
            host: "52.57.192.243",
            port: 8546,
            network_id: "*", // Match any network id,
            gas: 4000000,
            gasPrice: 20000000000,
            from: "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a"
        }
    }
};
