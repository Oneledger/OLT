pragma solidity 0.4.21;

import "./OneledgerToken.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract ICO {
  using SafeMath for uint256;

  struct Registration {
    uint8 tierIndex;
    bool isInWhiteList;
    uint256 offeredWei;
    uint256 usedWei;
    uint256 lastUsed;
  }

  ERC20 public token;

  // Address where funds are collected
  address public wallet;

  // How many token units a buyer gets per eth
  uint256 public rate;


  mapping(uint8 => mapping (address => Registration)) tiers;


  uint256 initialTime;

  bool saleClosed;

  address owner;

  event PurchaseToken(uint256 weiAmount, uint256 rate, uint256 token, address beneficiary);

  modifier isNotClosed() {
    require(!saleClosed);
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
    saleClosed = false;

    owner = msg.sender;

    tiers[0][address(0)] =  Registration(0,false, 0, 0, now);
  }

  /**
  * @dev add to white list
  * param tierIndex 0,1,2,3 to indicate the tier tierIndex
  * param toList the list of address added to white list
  * param weiPerContributor the wei can be transfer per contributor
  * param capWeiPerTier
  */
  function whiteList(uint8 tierIndex, address[] toList, uint256 weiPerContributor) public onlyOwner {
    require(tierIndex>=0 && tierIndex < 4);
    for (uint32 i = 0 ; i < toList.length; i ++){
      tiers[tierIndex][toList[i]].isInWhiteList = true;
      tiers[tierIndex][toList[i]].offeredWei = weiPerContributor; //overriding even if the address exists
      tiers[tierIndex][toList[i]].usedWei = 0;
      tiers[tierIndex][toList[i]].tierIndex = tierIndex;
      tiers[tierIndex][toList[i]].lastUsed = now;
    }
  }

  /**
  * @dev close the ICO
  */
  function closeSale() public onlyOwner {
    saleClosed = true;
  }

  function updateRate(uint256 rate_) public onlyOwner {
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
  function buyTokens() public payable isNotClosed returns (bool) {
    uint256 timePassed = now - initialTime;
    Registration storage registration = findUserFromWhiteList(msg.sender);
    require(registration.isInWhiteList == true);

    if (timePassed > 48 hours) {
      // Free for all
      return freeForAll();
    } else if (timePassed > 24 hours ) {
      //Double offering stage
      return buyWithLimit(registration.offeredWei.mul(2), resetUsedWei(registration));
    } else {
      //Buy token per limit
      return buyWithLimit(registration.offeredWei, registration);
    }

  }

  function resetUsedWei(Registration registration) internal returns (Registration) {
    if(registration.lastUsed - initialTime <= 24 hours) {
      tiers[registration.tierIndex][msg.sender].usedWei = 0;
      return tiers[registration.tierIndex][msg.sender];
    } else {
      return registration;
    }
  }

  function freeForAll() internal returns (bool) {
    uint256 weiAmount = msg.value;
    require(weiAmount != 0);
    uint256 tokenToBuy = weiAmount.mul(rate);
    if (doPurchase(tokenToBuy)) {
      PurchaseToken(weiAmount, rate, tokenToBuy, msg.sender);
      return true;
    }
  }

  function buyWithLimit(uint256 limitation, Registration registration) internal returns(bool) {
    uint256 weiAmount = msg.value;
    require(weiAmount != 0 && weiAmount <= (limitation - registration.usedWei));
    uint256 tokenToBuy = weiAmount.mul(rate);
    if(doPurchase(tokenToBuy)){
      tiers[registration.tierIndex][msg.sender].usedWei += weiAmount;
      tiers[registration.tierIndex][msg.sender].lastUsed = now;
      PurchaseToken(weiAmount, rate, tokenToBuy, msg.sender);
      return true;
    }
  }

  function doPurchase(uint256 tokenToBuy) internal returns (bool) {
    address _beneficiary = msg.sender;
    require(_beneficiary != 0);
    token.transfer(_beneficiary, tokenToBuy);
    wallet.transfer(msg.value);
    return true;
  }

  function findUserFromWhiteList(address user) internal view returns (Registration storage) {
    for(uint8 i = 0; i < 4; i++) {
      Registration storage registration = tiers[i][user];
      if(registration.isInWhiteList == true) {
        return registration;
      }
    }

    return tiers[0][address(0)];
  }
}
