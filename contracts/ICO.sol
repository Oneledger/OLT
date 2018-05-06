pragma solidity 0.4.23;

import "./OneledgerToken.sol";
import "./OneledgerTokenVesting.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract ICO is Ownable {
    using SafeMath for uint256;

    struct WhiteListRecord {
        bool isInWhiteList;
        uint256 offeredWei;
        uint256 lastPurchasedTimestamp;
    }

    OneledgerToken public token;
    address public wallet; // Address where funds are collected
    uint256 public rate;     // How many token units a buyer gets per eth
    mapping(address => WhiteListRecord) private whiteList;
    uint256 private initialTime;
    bool private saleClosed;
    uint256 public weiCap;
    uint256 public weiRaised;

    uint256 public totalTokenSupply = 1000000000 * (10 ** 18);

    event BuyTokens(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);

    /**
    * @dev constructor
    */
    function ICO(address _wallet, uint256 _rate, uint256 _startDate, uint256 _weiCap) public {
        require(_rate > 0);
        require(_wallet != address(0));
        require(_weiCap.mul(_rate) <= totalTokenSupply);

        wallet = _wallet;
        rate = _rate;
        initialTime = _startDate;
        saleClosed = false;
        weiCap = _weiCap;
        weiRaised = 0;

        token = new OneledgerToken();
    }

    /**
     * @dev fallback function ***DO NOT OVERRIDE***
     */
    function() external payable {
        buyTokens();
    }

    /**
     * @dev buy tokens
     */
    function buyTokens() public payable {
        validatePurchase(msg.value);
        uint256 tokenToBuy = msg.value.mul(rate);
        whiteList[msg.sender].lastPurchasedTimestamp = now;
        weiRaised = weiRaised.add(msg.value);
        token.mint(msg.sender, tokenToBuy);
        wallet.transfer(msg.value);
        emit BuyTokens(msg.value, rate, tokenToBuy, msg.sender);
    }

    /**
    * @dev add to white list
    * param addresses the list of address added to white list
    * param weiPerContributor the wei can be transfer per contributor
    * param capWei for the user in this list
    */
    function addToWhiteList(address[] addresses, uint256 weiPerContributor) public onlyOwner {
        for (uint32 i = 0; i < addresses.length; i++) {
            whiteList[addresses[i]] = WhiteListRecord(true, weiPerContributor, 0);
        }
    }

    /**
     * @dev mint token to new address, either contract or a wallet
     * param OneledgerTokenVesting vesting contract
     * param uint256 total token number to mint
    */
    function mintToken(address target, uint256 tokenToMint) public onlyOwner {
      token.mint(target, tokenToMint);
    }

    /**
     * @dev close the ICO
      param newOwner new owner of the token contract
     */
    function closeSale(address newOwner) public onlyOwner {
        saleClosed = true;
        token.mint(newOwner, totalTokenSupply.sub(token.totalSupply()));
        token.finishMinting();
        token.transferOwnership(newOwner);
    }

    function validatePurchase(uint256 weiPaid) internal {
        require(!saleClosed);
        require(initialTime <= now);
        require(whiteList[msg.sender].isInWhiteList);
        require(weiPaid <= weiCap - weiRaised);
        // can only purchase once every 24 hours
        require(now.sub(whiteList[msg.sender].lastPurchasedTimestamp) > 24 hours);
        uint256 elapsedTime = now.sub(initialTime);
        // check day 1 buy limit
        require(elapsedTime > 24 hours || msg.value <= whiteList[msg.sender].offeredWei);
        // check day 2 buy limit
        require(elapsedTime > 48 hours || msg.value <= whiteList[msg.sender].offeredWei.mul(2));
    }
}
