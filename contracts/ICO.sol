pragma solidity ^0.4.11;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ICO {
  using SafeMath for uint256;

  struct Registration {
    bool isInWhiteList;
    uint256 offeredToken;
  }

  ERC20 public token;

  // Address where funds are collected
  address public wallet;

  // How many token units a buyer gets per eth
  uint256 public rate;


  mapping(uint8 => mapping (address => Registration)) tiers;


  uint256 initialTime;

  bool closed;

  address owner;

  event PurchaseToken(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);

  modifier isNotClosed() {
    require(closed == false);
    _;
  }

  /**
  * @dev control the behavior can only be done by owner
  */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
  * @dev constructor
  */
  function ICO(address _wallet, ERC20 _token, uint256 _rate) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_token != address(0));

    wallet = _wallet;
    token = _token;
    rate = _rate;
    initialTime = now;
    closed = false;

    owner = msg.sender;
  }

  /**
  * @dev add to white list
  * param tierIndex 0,1,2,3 to indicate the tier tierIndex
  * param toList the list of address added to white list
  * param weiPerContributor the wei can be transfer per contributor
  * param capWeiPerTier
  */
  function whiteList(uint8 tierIndex, address[] toList, uint256 weiPerContributor) public onlyOwner{
    require(tierIndex>=0 && tierIndex < 4);
    for (uint32 i = 0 ; i < toList.length; i ++){
      tiers[tierIndex][toList[i]].isInWhiteList = true;
      tiers[tierIndex][toList[i]].offeredToken = weiPerContributor; //overriding even if the address exists
    }
  }

  /**
  * @dev close the ICO
  */
  function icoClosed() public onlyOwner{
    closed = true;
  }

  function updateRate(uint256 rate_) public onlyOwner{
    rate = rate_;
  }

  /**
   * @dev fallback function ***DO NOT OVERRIDE***
   */
  function () external payable {
    buyTokens();
  }

  /**
   * @dev buy tokens
   */
  function buyTokens() public payable isNotClosed returns (bool){
    uint256 timePassed = now - initialTime;
    var (isInWhiteList, offeredToken) = findUserFromWhiteList(msg.sender);
    require(isInWhiteList == true);

    if (timePassed > 48 hours) {
      // Free for all
      return freeForAll();
    }else if (timePassed > 24 hours ){
      //Double offering stratege
      return buyWithLimit(offeredToken.mul(2));
    }else{
      //Buy token per limit
      return buyWithLimit(offeredToken);
    }

  }

  function freeForAll() internal returns (bool){
    uint256 weiAmount = msg.value;
    require(weiAmount != 0);
    uint256 tokenToBuy = weiAmount.mul(rate);
    return doPurchase(tokenToBuy, weiAmount);
  }

  function buyWithLimit(uint256 limitation) internal returns(bool){
    uint256 weiAmount = msg.value;
    require(weiAmount != 0);
    uint256 tokenToBuy = weiAmount.mul(rate);
    require(tokenToBuy <= limitation);
    return doPurchase(tokenToBuy, weiAmount);
  }

  function doPurchase(uint256 tokenToBuy, uint256 weiAmount) internal  returns (bool){
    address _beneficiary = msg.sender;
    require(_beneficiary != 0);
    token.transfer(_beneficiary, tokenToBuy);
    wallet.transfer(msg.value);
    PurchaseToken(weiAmount, rate, tokenToBuy, _beneficiary);
    return true;
  }

  function findUserFromWhiteList(address user) internal returns (bool isInWhiteList, uint256 offeredToken){
    for(uint8 i = 0; i < 4; i++){
      Registration storage registration = tiers[i][user];
      if(registration.isInWhiteList == true) {
        return (true, registration.offeredToken);
      }
    }

    return (false, 0);
  }
}
