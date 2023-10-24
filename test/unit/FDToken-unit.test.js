const { getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains, INITIAL_SUPPLY } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name) 
    ? describe.skip
    : describe("FDToken Unit Test", function() {
        const multiplier = 10 ** 18
        let deployer, user1, fdToken
        beforeEach(async function() {
            deployer = (await getNamedAccounts()).deployer
            user1 = (await getNamedAccounts()).user1
            const signerDr = ethers.getSigner(deployer)
            await deployments.fixture(["all"])
            fdToken = await ethers.getContractAt("FDToken", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
            // "0x5FbDB2315678afecb367f032d93F642f64180aa3"
        })
        it("was deployed", async () => {
            assert(fdToken.address)
        })
        describe("constructor", () => {
            it("Should have correct INITIAL_SUPPLY of token", async () => {
                const totalSupply = await fdToken.totalSupply()   
                console.log(totalSupply)      
                assert.equal(totalSupply.toString(),INITIAL_SUPPLY)
            })
            it("initializes the token with the correct name and symbol", async () => {
                const name = await fdToken.name()
                assert.equal(name.toString(), "FeeDu")

                const symbol = await fdToken.symbol()
                assert.equal(symbol.toString(), "FD")
            })
        })
        describe("transfer", () => {
            it("Should be able to transfer tokens successfully to an address", async() => {
                const tokensToSend = ethers.utils.parseEther("10")
                await fdToken.transfer(user1, tokensToSend)
                expect(await fdToken.balanceOf(user1)).to.equal(tokensToSend)
            })
            it("emits an transfer event, when an transfer occurs", async() => {
                const transfer = await fdToken.transfer(user1, 10 * multiplier).toString()
                expect(transfer).to.emit(fdToken, "Transfer")
            })
        })
        describe("allowances", () => {
            const amount = ( 20 * multiplier).toString()
            beforeEach(async() => {
                const signer = await ethers.getSigner(user1)
                spenderToken = await ethers.getContractAt("FDToken","0x5FbDB2315678afecb367f032d93F642f64180aa3", signer)
            })
            it("Should approve other address to spend token", async() => {
                const tokensToSpend = ethers.utils.parseEther("5")
                await fdToken.approve(user1, tokensToSpend)
                await spenderToken.transferFrom(deployer, user1, tokensToSpend)
                expect(await spenderToken.balanceOf(user1)).to.equal(tokensToSpend)
            })
            it("doesn't allow an unapproved member to do transfer", async() => {
                await expect(spenderToken.transferFrom(deployer, user1, amount)).to.be.revertedWith("ERC20InsufficientAllowance")
            })
            it("emits an approval event, when an approval occurs", async() => {
                const approval = await fdToken.approve(user1, amount).toString()
                expect(approval).to.emit(fdToken, "Approval")
            })
            it("the allowance being set is accurate", async() => {
                await fdToken.approve(user1, amount)
                const allowance = await fdToken.allowance(deployer, user1)
                assert.equal(allowance.toString(), amount)
            })
            it("won't allow a user to go over the allowance", async() => {
                await fdToken.approve(user1, amount)
                await expect(spenderToken.transferFrom(deployer, user1, (50 * multiplier).toString())).to.be.revertedWith("ERC20: insufficient allowance")
            })
        })
    })