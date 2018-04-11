pragma solidity 0.4.21;

library ReleasePlanStruct {
  struct TimeLocker {
    uint256 releaseTime;
    uint256 frozenTokens; // the number of tokens frozen until 'releaseTime'
  }
  struct ReleasePlan {
    bool initialized;
    TimeLocker[] timeLockers;
  }
}
