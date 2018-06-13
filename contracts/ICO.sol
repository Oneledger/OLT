pragma solidity 0.4.24;

import "./OneledgerToken.sol";
import "./OneledgerTokenVesting.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract ICO is Ownable {
    using SafeMath for uint256;

    struct WhiteListRecord {
        uint256 offeredWei;
        uint256 lastPurchasedTimestamp;
    }

    OneledgerToken public token;
    address public wallet; // Address where funds are collected
    uint256 public rate;   // How many token units a buyer gets per eth
    mapping (address => WhiteListRecord) public whiteList;
    uint256 public initialTime;
    bool public saleClosed;
    uint256 public weiCap;
    uint256 public weiRaised;

    uint256 public TOTAL_TOKEN_SUPPLY = 1000000000 * (10 ** 18);

    event BuyTokens(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);
    event UpdateRate(uint256 rate);
    event UpdateWeiCap(uint256 weiCap);
    /**
    * @dev constructor
    */
    constructor(address _wallet, uint256 _rate, uint256 _startDate, uint256 _weiCap) public {
        require(_rate > 0);
        require(_wallet != address(0));
        require(_weiCap.mul(_rate) <= TOTAL_TOKEN_SUPPLY);

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
     * @dev update the rate
     */
    function updateRate(uint256 rate_) public onlyOwner {
      require(now <= initialTime);
      rate = rate_;
      emit UpdateRate(rate);
    }

    /**
     * @dev update the weiCap
     */
    function updateWeiCap(uint256 weiCap_) public onlyOwner {
      require(now <= initialTime);
      weiCap = weiCap_;
      emit UpdateWeiCap(weiCap_);
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
            whiteList[addresses[i]] = WhiteListRecord(weiPerContributor, 0);
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
     */
    function closeSale() public onlyOwner {
        saleClosed = true;
        if (TOTAL_TOKEN_SUPPLY > token.totalSupply()) {
          token.mint(owner, TOTAL_TOKEN_SUPPLY.sub(token.totalSupply()));
        }
        token.finishMinting();
        token.transferOwnership(owner);
    }

    function validatePurchase(uint256 weiPaid) internal view{
        require(!saleClosed);
        require(initialTime <= now);
        require(whiteList[msg.sender].offeredWei > 0);
        require(weiPaid <= weiCap.sub(weiRaised));
        // can only purchase once every 24 hours
        require(now.sub(whiteList[msg.sender].lastPurchasedTimestamp) > 24 hours);
        uint256 elapsedTime = now.sub(initialTime);
        // check day 1 buy limit
        require(elapsedTime > 24 hours || msg.value <= whiteList[msg.sender].offeredWei);
        // check day 2 buy limit
        require(elapsedTime > 48 hours || msg.value <= whiteList[msg.sender].offeredWei.mul(2));
    }
}
