pragma solidity ^0.4.11;

contract Owned {

    address public owner = msg.sender;
    address public potentialOwner;

    modifier onlyOwner {
      require(msg.sender == owner);
      _;
    }

    modifier onlyPotentialOwner {
      require(msg.sender == potentialOwner);
      _;
    }

    event NewOwner(address old, address current);
    event NewPotentialOwner(address old, address potential);

    function setOwner(address _new)
      onlyOwner
    {
      NewPotentialOwner(owner, _new);
      potentialOwner = _new;
      // owner = _new;
    }

    function confirmOwnership()
      onlyPotentialOwner
    {
      NewOwner(owner, potentialOwner);
      owner = potentialOwner;
      potentialOwner = 0;
    }
}