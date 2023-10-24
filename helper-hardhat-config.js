const networkConfig = {
    31337: {
        name: "hardhat",
    },
    11155111: {
        name: "sepolia",
    },
}
const INITIAL_SUPPLY = "1000000000000000000000000"

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    INITIAL_SUPPLY,
    developmentChains,
}