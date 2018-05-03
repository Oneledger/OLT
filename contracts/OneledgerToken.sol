pragma solidity 0.4.21;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";


/**
* @title OneledgerToken
* @dev this is the oneledger token
*/
contract OneledgerToken is MintableToken {
    using SafeMath for uint256;

    string public name = "Oneledger Token";
    string public symbol = "OLT";
    uint256 public decimals = 18;
    bool public active;

    /**
     * @dev restrict function to be callable by the owner or when token is active
     */
    modifier isActived() {
        require(active == true); // owner can call even when inactive
        _;
    }

    /**
     * @dev constructor
     * param initial_supply not include decimals
     */
    function OneledgerToken() public {
        active = false;
    }

    /**
     * @dev activate token transfers
     */
    function activate() public onlyOwner {
        active = true;
    }

    /**
     * @dev transfer    ERC20 standard transfer wrapped with isActived
     */
    function transfer(address to, uint256 value) public isActived    returns (bool) {
        return super.transfer(to, value);
    }

    /**
     * @dev transfer    ERC20 standard transferFrom wrapped with isActived
     */
    function transferFrom(address from, address to, uint256 value) public isActived returns (bool) {
        return super.transferFrom(from, to, value);
    }
}
