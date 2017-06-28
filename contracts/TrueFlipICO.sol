pragma solidity ^0.4.11;

import "./TrueFlipToken.sol";
import "./SafeMath.sol";
import "./Owned.sol";


/// @title TrueFlipICO contract - Takes funds from users and issues tokens.
/// @author Zerion - <inbox@zerion.io>
contract TrueFlipICO is SafeMath, Owned {
    function toString(address x) returns (string) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }

    /*
     * Contract params
     */
    TrueFlipToken public token;

    address public teamAddress;
    address public advisoryAddress;
    address public escrowAddress;
    uint public startBlock;
    uint public endBlock; //calculates from startBlock

    /*
        Contract consts
    */
    uint public constant tokensPerSatoshi = 2000;
    uint public constant targetSatoshi = 6125 * 10 ** 8;
    uint public constant teamPercentOfTotal = 20;
    uint public constant advisoryPercentOfTotal = 10;
    uint public constant maxICOIssuance = 13650000 * 10 ** 8;

    /*
        Contract state
    */
    bool public icoFinalized = false;
    uint public satoshiPerEther = 0;
    uint public tokensIssuedDuringICO = 0;
    uint public satoshiCollected = 0;

    /*
     *  Modifiers
     */

    modifier minInvestment(uint investment) {
      // User has to send at least 0.01 Eth
      require(investment >= 10 ** 16);
      _;
    }

    //Event
    event Investment(uint satoshi, address issuedTo, uint tokens, uint bonus, string investor, uint investmentId);

    /// @dev Returns bonus for the specific moment
    function getBonus()
        public
        constant
        returns (uint)
    {
      // have different bonus
      if (satoshiCollected >= mul(5001, 10 ** 8)) {
          return 1000;  // 0% :)
      } else if (satoshiCollected >= mul(3001, 10 ** 8)) {
          return 1050;  // 5% :D
      } else if (satoshiCollected >= mul(2001, 10 ** 8)) {
          return 1100;  // 10% $_$
      } else if (satoshiCollected >= mul(1001, 10 ** 8)) {
          return 1200;  // 20% $$_$$
      } else {
          return 1300;  // 30% $$$_$$$
      }
    }

    function setExchangeRate(uint rate)
        public
        onlyOwner
    {
        // If the rate is below or equal zero, throw
        require(rate > 0);
        satoshiPerEther = rate;
    }

    function calculateTokens(uint investmentInSatoshi)
        public
        constant
        returns (uint)
    {
      // Calculate discounted number of tokens per 1 satoshi
      uint discountedTokensPerSatoshi = div(mul(tokensPerSatoshi, getBonus()), 1000);

      return mul(investmentInSatoshi, discountedTokensPerSatoshi);
    }


    /// @dev Issues tokens for users who made BTC purchases.
    /// @param investmentInSatoshi Invested amount in Satoshi
    /// @param beneficiary Address the tokens will be issued to.
    /// @param investorId Investor ID in database
    /// @param investmentId Investment ID in database
    function doInvestment(uint investmentInSatoshi, address beneficiary, string investorId, uint investmentId, bool transfer)
        private
    {
        require(isActive());
        uint tokenCount = calculateTokens(investmentInSatoshi);
        require(token.mint(beneficiary, tokenCount, transfer));

        Investment(investmentInSatoshi, beneficiary, tokenCount, getBonus(), investorId, investmentId);

        incrementCounters(investmentInSatoshi, tokenCount);
    }

    function investment(uint investmentInSatoshi, address beneficiary, string investorId, uint investmentId)
        public
        onlyOwner
    {
        return doInvestment(investmentInSatoshi, beneficiary, investorId, investmentId, false);
    }

    /// @dev Increments collected satoshi and tokens
    /// @param investment Invested amount in Satoshi
    /// @param tokenCount Number of tokens issued
    function incrementCounters(uint investment, uint tokenCount)
        private
    {
      // Update collected satoshi.
      satoshiCollected = add(satoshiCollected, investment);
      // Require that no more than maxICOIssuance tokens created during the ICO.
      require(add(tokensIssuedDuringICO, tokenCount) <= maxICOIssuance);
      // Update fund's and user's balance and total supply of tokens.
      tokensIssuedDuringICO = add(tokensIssuedDuringICO, tokenCount);
    }

    function setTeamAddress(address newAddress)
        public
        onlyOwner
    {
       teamAddress = newAddress;
    }

    /// @notice This manages the ICO state machine
    /// We make it a function and do not assign the result to a variable
    /// So there is no chance of the variable being stale
    function isActive()
      public
      constant
      returns (bool)
    {
      if (icoFinalized) {
          return false;
      } else if (block.number > endBlock || tokensIssuedDuringICO >= maxICOIssuance - 1 * 10 ** 8) {
          // If the block number is more than endBlock or there is less than one token to go.
          return false;
      } else if (block.number >= startBlock) {
          return true;
      } else {
          return false;
      }
    }

    /// @notice Finalize ICO
    /// @dev Required state: Success
    function finalizeICO()
      public
      onlyOwner
    {
        require(!isActive());
        require(block.number >= startBlock);

        icoFinalized = true;
        uint256 icoCoins = token.totalSupply();

        uint256 boardPercent = teamPercentOfTotal + advisoryPercentOfTotal;
        uint256 percentTokens = div(icoCoins, 100 - boardPercent);

        uint256 teamTokens = mul(percentTokens, teamPercentOfTotal);
        uint256 advisoryTokens = mul(percentTokens, advisoryPercentOfTotal);

        tokensIssuedDuringICO = add(icoCoins, teamTokens);
        tokensIssuedDuringICO = add(tokensIssuedDuringICO, advisoryTokens);

        require(token.mint(teamAddress, teamTokens, false));
        require(token.mint(advisoryAddress, advisoryTokens, false));
        require(token.finalize());
    }

    /// @dev Contract constructor
    function TrueFlipICO(address ownerAddress, address tokenAddress, address teamAddress_, address advisoryAddress_, address escrowAddress_, uint startBlock_)
    {
        token = TrueFlipToken(tokenAddress);
        owner = ownerAddress;
        teamAddress = teamAddress_;
        advisoryAddress = advisoryAddress_;
        escrowAddress = escrowAddress_;
        startBlock = startBlock_;
        endBlock = startBlock + 200000; // ~= 3600 * 24 * 35 / 14 (ethereum block period)
    }

    // @dev Fallback function
    function () payable {
        uint investedSatoshis = div(mul(msg.value, satoshiPerEther), 10 ** 18);
        doInvestment(investedSatoshis, msg.sender, toString(msg.sender), satoshiCollected, true);
        require(escrowAddress.send(msg.value));
    }
}
