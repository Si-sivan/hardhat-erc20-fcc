const { network } = require("hardhat")
const { INITIAL_SUPPLY, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy ,log } = deployments
    const { deployer} = await getNamedAccounts()
    const FDToken = await deploy("FDToken", {
        from: deployer,
        args: [INITIAL_SUPPLY],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FDToken deployed at ${FDToken.address}`)
    // 如果是部署在测试网上，则需要进行验证
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(FDToken.address, [INITIAL_SUPPLY])
    }
}

module.exports.tags = ["all", "token"]
