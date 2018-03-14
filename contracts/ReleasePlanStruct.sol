pragma solidity ^0.4.11;

library ReleasePlanStruct {
  struct TimeLocker {
    uint256 releaseTime;
    uint256 allowedTokens;
  }
  struct ReleasePlan {
    uint8 flag;
    uint256 totalTransferredTokens;
    TimeLocker[] timeLockers;
  }
}
