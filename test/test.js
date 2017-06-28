constants = require('./constants.js');

var TrueFlipICO = artifacts.require("./TrueFlipICO.sol");
var TrueFlipToken = artifacts.require("./TrueFlipToken.sol");

contract('TrueFlipICO', function(accounts) {

    it("Should verify start and end block", function(done) {
      var icoContract;
      var tokenContract;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return icoContract.startBlock.call();
      }).then(function(blockNumber) {
          assert.equal(blockNumber.toNumber(), constants.startBlock,
              "Start Block is incorrect!");
          return icoContract.endBlock.call();
      }).then(function(blockNumber) {
          assert.equal(blockNumber.toNumber(), constants.endBlock,
              "End Block is incorrect!");
      }).then(done);
    });

    it("Should verify max total supply", function(done) {
        TrueFlipToken.deployed().then(function(instance) {
            return instance.maxSupply.call();
        }).then(function(supply) {
            assert.equal(supply.toNumber(), constants.maxTokenSupply,
                "Wrong max total supply");
        }).then(done);
    });

    it("Should verify number of PreICO tokens", function(done) {
      var tokenContract;

      TrueFlipToken.deployed().then(function(instance) {
          tokenContract = instance;
          return tokenContract.totalSupply.call();
      }).then(function(totalSupply) {
          assert.equal(totalSupply, constants.preICOsupply);
      }).then(done);
    });

    it("Should test exchange rate changing", function(done) {
      var icoContract;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return icoContract.setExchangeRate(constants.satoshiPerEther, { from: constants.owner });
      }).then(function(tx) {
          return icoContract.satoshiPerEther.call();
      }).then(function(rate) {
          assert.equal(rate.toNumber(), constants.satoshiPerEther);
      }).then(done);
    });

    it("Should test direct investment", function(done) {
      var icoContract;
      var tokenContract;
      var investedWei = web3.toWei(1, "ether");
      var investedSatoshis;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return TrueFlipToken.deployed();
      }).then(function(instance) {
          tokenContract = instance;
          // Send money from Owner's account.
          return icoContract.send(investedWei);
      }).then(function(result) {
          investedSatoshis = investedWei * constants.satoshiPerEther / Math.pow(10, 18);

          // This transaction should trigger InvestmentReceived event.
          for (var log in result.logs) {
            if (log.event == "Investment") {
              assert.equal(log.args.satoshi, investedSatoshis,
                  "Invalid satoshi number");
            }
          }
          return web3.eth.getBalance(constants.escrowAddress);
      }).then(function(balance) {
          assert.equal(investedWei, balance.toNumber(), "Invalid escrowAddress balance");
          return tokenContract.balanceOf.call(constants.owner);
      }).then(function(tokenCount) {
          // Bonus is 30% at this moment, no other investments happened.
          var bonus = 0.3;
          var discountedTokensPerSatoshi = parseInt(constants.tokensPerSatoshi * (1 + bonus));
          var expectedTokens = discountedTokensPerSatoshi * investedSatoshis;
          assert.equal(expectedTokens, tokenCount.toNumber(),
              "Invalid number of tokens issued");
      }).then(done);
    });

    it("Should test ICO cap", function(done) {
      var icoContract;
      var tokenContract;
      var largeInvestment = web3.toWei(90000, "ether");
      var investedSatoshis;
      var currentBalance;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return TrueFlipToken.deployed();
      }).then(function(instance) {
          tokenContract = instance;
          tokenContract.totalSupply.call().then(function(supply) {
              currentBalance = supply.toNumber();
          });
          return icoContract.sendTransaction({value: largeInvestment, from: constants.firstInvestor});
      }).catch(function(e) {
          return tokenContract.totalSupply.call();
      }).then(function(supply) {
          assert.equal(supply.toNumber(), currentBalance);
      }).then(done);
    });

    it("Should test bonus change", function(done) {
      var icoContract;
      var tokenContract;
      var investedWei = web3.toWei(10000, "ether");
      var investedSatoshis;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return TrueFlipToken.deployed();
      }).then(function(instance) {
          tokenContract = instance;
          // Send money from firstInvestor account.
          return icoContract.sendTransaction({ value: investedWei, from: constants.firstInvestor });
      }).then(function(result) {
          investedSatoshis = investedWei * constants.satoshiPerEther / Math.pow(10, 18);
          return web3.eth.getBalance(constants.escrowAddress);
      }).then(function(balance) {
          // 1 Ether from previous investment and 10000 Ether from this one.
          assert.equal(parseInt(investedWei) + parseInt(web3.toWei(1, "ether")), balance.toNumber(), "Invalid teamAddress balance");
          return tokenContract.balanceOf.call(constants.firstInvestor);
      }).then(function(tokenCount) {
          var bonus = 0.3; // Should be 30% at this stage.
          var discountedTokensPerSatoshi = parseInt(constants.tokensPerSatoshi * (1 + bonus));
          var expectedTokens = discountedTokensPerSatoshi * investedSatoshis;
          assert.equal(expectedTokens, tokenCount.toNumber(),
              "Invalid number of tokens issued");
          return icoContract.getBonus.call();
      }).then(function(bonus) {
          var expectedBonus = 1200; // 20%
          assert.equal(bonus.toNumber(), expectedBonus, "Invalid bonus did not change");
      }).then(done);
    });

    it("Should test investment with benifeciary", function(done) {
      var icoContract;
      var tokenContract;
      var investedSatoshis = 100000000; // 1 BTC
      var beneficiary = "0x1234512345123451234512345123451234512345";

      var expectedTokens;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return TrueFlipToken.deployed();
      }).then(function(instance) {
          tokenContract = instance;
          icoContract.investment(investedSatoshis, beneficiary, 1234, 1, { from: constants.owner });
          return TrueFlipToken.deployed();
      }).then(function(tx) {
          return tokenContract.balanceOf.call(beneficiary);
      }).then(function(balance) {
          // if client invests this way, no tokens should be transferred,
          // just reserved
          // 1 Ether from previous investment and 10000 Ether from this one.
          var bonus = 0.2;
          var discountedTokensPerSatoshi = parseInt(constants.tokensPerSatoshi * (1 + bonus));
          expectedTokens = discountedTokensPerSatoshi * investedSatoshis;
          return tokenContract.mintedTokens.call();
      }).then(function(reserveAddress) {
          return tokenContract.allowance.call(reserveAddress, beneficiary);
      }).then(function(reservedTokens) {
          assert.equal(reservedTokens.toNumber(), expectedTokens, "Tokens weren't reserved correctly.");
      }).then(done);
    });

    it("Should test investment without benifeciary", function(done) {
        var icoContract;
        var tokenContract;
        var investedSatoshis = 100000000; // 1 BTC
        var balanceBefore;
        var reserveAddress;

        TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return TrueFlipToken.deployed();
        }).then(function(instance) {
            tokenContract = instance;
            return tokenContract.mintedTokens.call();
        }).then(function(address) {
            reserveAddress = address;
          return tokenContract.balanceOf.call(reserveAddress);
        }).then(function(balance) {
            balanceBefore = balance;
            return icoContract.investment(investedSatoshis, 0, 1234, 1, { from: constants.owner });
        }).then(function() {
          return tokenContract.balanceOf.call(reserveAddress);
        }).then(function(balance) {
            var bonus = 0.2;
            var discountedTokensPerSatoshi = parseInt(constants.tokensPerSatoshi * (1 + bonus));
            var expectedTokens = discountedTokensPerSatoshi * investedSatoshis;
            assert.equal(balance - balanceBefore, expectedTokens, "Tokens weren't reserved correctly.");
        }).then(done);
    });

    it("Should test ICO selling-out", function(done) {
      var icoContract;
      var tokenContract;
      var investedWei = web3.toWei(10000, "ether");
      var weiToSellOut;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return TrueFlipToken.deployed();
      }).then(function(instance) {
          tokenContract = instance;
          weiToSellMostlySellOut = web3.toWei(31650, "ether");
          // Send money from firstInvestor account.
          return icoContract.sendTransaction({ value: weiToSellMostlySellOut, from: constants.firstInvestor });
      }).then(function(result) {
          return icoContract.tokensIssuedDuringICO.call();
      }).then(function(alreadyIssued) {
          tokensLeft = constants.maxICOIssuance - alreadyIssued.toNumber() - 0.01 * Math.pow(10, 8);
          // Calculate correct number of satoshis to buy-out the ICO.
          var satoshisToSellOut = parseInt(tokensLeft) / constants.tokensPerSatoshi;
          weiToSellOut = (satoshisToSellOut * Math.pow(10, 18)) / constants.satoshiPerEther;
          // Send money from firstInvestor account.
          return icoContract.sendTransaction({ value: weiToSellOut, from: constants.firstInvestor });
      }).then(function(result) {
          return icoContract.tokensIssuedDuringICO.call();
      }).then(function(alreadyIssued) {
          // console.log(alreadyIssued);
          return icoContract.isActive.call();
      }).then(function(active) {
          // State is not active.
          assert(!active);
      }).then(done);
    });

    it("Should change ownership", function(done) {
      var tokenContract;

      TrueFlipToken.deployed().then(function(instance) {
          tokenContract = instance;
          return tokenContract.setOwner(constants.newOwner, { from: constants.owner });
      }).then(function(tx) {
          return tokenContract.potentialOwner.call();
      }).then(function(potentialOwner) {
          assert.equal(potentialOwner, constants.newOwner);
          return tokenContract.confirmOwnership({ from: constants.newOwner });
      }).then(function(tx) {
          return tokenContract.owner.call();
      }).then(function(owner) {
          assert.equal(owner, constants.newOwner);
      }).then(done);
    });

    it("Should test finalization", function(done) {
      var icoContract;
      var tokenContract;

      TrueFlipICO.deployed().then(function(instance) {
          icoContract = instance;
          return TrueFlipToken.deployed();
      }).then(function(instance) {
          tokenContract = instance;
          return icoContract.finalizeICO();
      }).then(function(result) {
          return icoContract.isActive.call();
      }).then(function(active) {
          // Check if state is now "Finalized"
          assert(!active);
          return tokenContract.totalSupply.call();
      }).then(function(supply) {
          var actualSupply = supply.toNumber() / Math.pow(10, 8);
          // Allow 1 token difference.
          assert.closeTo(constants.maxTokenSupply / Math.pow(10, 8), actualSupply, 1);
      }).then(done);
    });
});

function getBonus(satoshiCollected) {
  if (satoshiCollected >= 5001 * Math.pow(10, 8)) {
      return 0;
  } else if (satoshiCollected >= 3001 * Math.pow(10, 8)) {
      return 0.05;
  } else if (satoshiCollected >= 2001 * Math.pow(10, 8)) {
      return 0.1;
  } else if (satoshiCollected >= 1001 * Math.pow(10, 8)) {
      return 0.2;
  } else {
      return 0.3;
  }
}
