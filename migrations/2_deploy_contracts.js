var TrueFlipToken = artifacts.require("TrueFlipToken.sol");
var TrueFlipICO = artifacts.require("TrueFlipICO.sol");

const satoshiPerEther = 12014999;

module.exports = function(deployer, network) {

    var owner, teamAddress, advisoryAddress, escrowAddress, startBlock;
    if (network == "live") {
        owner = "0xc890b1f532e674977dfdb791cafaee898dfa9671";
        newOwner = "0xB46C44FaCc34C1475124152404832f797da08C94";
        teamAddress = owner;
        advisoryAddress = owner;
        escrowAddress = owner;
        startBlock = 0; //TODO fix
    } else if (network == "testnet") {
        owner = "0x42ccb9b37dd47dec2bbf85d01b0202ca237e109d";
        teamAddress = "0xc890b1f532e674977dfdb791cafaee898dfa9671";
        advisoryAddress = "0x0021960c030e065c3BD490AB9bcc31B93e1fb23c";
        escrowAddress = "0x00c539B1DCbAd08a652aCA4690c9F3e805D31808";
        startBlock = 0;
    } else if (network == "kovan") {
        owner = "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a";
        newOwner = "0xB46C44FaCc34C1475124152404832f797da08C94";
        teamAddress = "0x3371a4920A9aF5F7A645674Cd503933508Ff6818";
        advisoryAddress = "0xCFe025ce02a80773410e29493235B1d72a21A222";
        escrowAddress = "0x2df334cd5c85a2eb04e3c87e7aec55dbe157121e";
        startBlock = 2320000;
    } else {
        owner = "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a";
        newOwner = "0xB46C44FaCc34C1475124152404832f797da08C94";
        teamAddress = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        advisoryAddress = "0x0021960c030e065c3BD490AB9bcc31B93e1fb23c";
        escrowAddress = "0x00c539B1DCbAd08a652aCA4690c9F3e805D31808";
        startBlock = 0;
    }

    var tokenContract, icoContract;

    var promise = deployer.deploy(TrueFlipToken, owner).then(function() {
        return deployer.deploy(TrueFlipICO, owner, TrueFlipToken.address, teamAddress, advisoryAddress, escrowAddress, startBlock);
    }).then(function(tx) {
        return TrueFlipToken.deployed();
    }).then(function(instance) {
        tokenContract = instance;
        return tokenContract.setMintAddress(TrueFlipICO.address, { from: owner });
    });

    if (network != "development") {
        promise.then(function(tx){
            return tokenContract.setOwner(newOwner, { from: owner });
        }).then(function(tx) {
            return TrueFlipICO.deployed();
        }).then(function(instance) {
            icoContract = instance;
            icoContract.setOwner(newOwner, { from: owner });
        });
    }
};
