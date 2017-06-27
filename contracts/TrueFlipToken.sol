pragma solidity ^0.4.11;

import "./StandardToken.sol";
import "./SafeMath.sol";
import "./Owned.sol";

/// @title Token contract - Implements Standard Token Interface for TrueFlip.
/// @author Zerion - <inbox@zerion.io>
contract TrueFlipToken is StandardToken, SafeMath, Owned {
    /*
     * External contracts
     */
    address public mintAddress;
    /*
     * Token meta data
     */
    string constant public name = "TrueFlip";
    string constant public symbol = "TFL";
    uint8 constant public decimals = 8;

    // 1 050 000 TFL tokens were minted during PreICO
    // 13 650 000 TFL tokens can be minted during ICO
    // 2 100 000 TFL tokens can be minted for Advisory
    // 4 200 000 TFL tokens can be minted for Team
    // Overall, 21 000 000 TFL tokens can be minted
    uint constant public maxSupply = 21000000 * 10 ** 8;

    // Only true until finalize function is called.
    bool public mintingAllowed = true;
    // Address where minted tokens are reserved
    address constant public mintedTokens = 0x6049604960496049604960496049604960496049;

    modifier onlyMint() {
        // Only minter is allowed to proceed.
        require(msg.sender == mintAddress);
        _;
    }

    /// @dev Function to change address that is allowed to do emission.
    /// @param newAddress Address of new emission contract.
    function setMintAddress(address newAddress)
        public
        onlyOwner
        returns (bool)
    {
        if (mintAddress == 0x0)
            mintAddress = newAddress;
    }

    /// @dev Contract constructor function sets initial token balances.
    function TrueFlipToken(address ownerAddress)
    {
        owner = ownerAddress;

        balances[mintedTokens] = mul(1050000, 10 ** 8);
        totalSupply = balances[mintedTokens];
    }

    function mint(address beneficiary, uint amount, bool transfer)
        external
        onlyMint
        returns (bool success)
    {
        require(mintingAllowed == true);
        require(add(totalSupply, amount) <= maxSupply);
        totalSupply = add(totalSupply, amount);
        if (transfer) {
            balances[beneficiary] = add(balances[beneficiary], amount);
        } else {
            balances[mintedTokens] = add(balances[mintedTokens], amount);
            if (beneficiary != 0) {
                allowed[mintedTokens][beneficiary] = amount;
            }
        }
        return true;
    }

    function finalize()
        public
        onlyMint
        returns (bool success)
    {
        mintingAllowed = false;
        return true;
    }

    function requestWithdrawal(address beneficiary, uint amount)
        public
        onlyOwner
    {
        allowed[mintedTokens][beneficiary] = amount;
    }

    function withdrawTokens()
        public
    {
        transferFrom(mintedTokens, msg.sender, allowance(mintedTokens, msg.sender));
    }
}
