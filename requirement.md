# Token Distribution requirement

## Concept

Token Name: OLT
Total Number: 100000000 * (10 ** decimal)
Distribution method:
- Team reserve: locked for 24 months with quarterly cliffs(release schedule 3, 6, 9, 12, 15, 18, 21, 24, total lock token)
- Advisor reserve: locked for 12 months with monthly release(release schedule 1,2,3,4,5,6,7,8,9,10,11,12)
- Company reserve: locked for 24 months with monthly release starting from the seventh month(release schedule 7,8,9,10,11,1,2,13,14... 24)
- Others?

## Requirement

Token contract:
  - The standard ERC 20 Token
  - Support TimeLock for transfer and transferFrom (different timelocks for different account)
  - After time lock ,the token can partially be transferred. The transferrable number will be increased quarterly or monthly

Pre-sales contract:
  - Presales contract will handle transfer the balance from token contract.
  - By transferring, the token will be set with time lock

Before ICO contract:
  - We deploy this contract the day before ICO
  - Buyer can send ETH to the contract and contract will send the one-day time locked token to the buyer

## Technical requirement

- add a active flag to active the token after it is listed
- add a time locker for certain addresses(by default there is no locker, this is for company, early investor or development team). The locker will define a schedule to unlock the token that they can transfer or transferFrom

- set a expiration date and duration to averagely to unlock the

## TimeLockCOntract

TimeLockContract.lock(user1,  2 year, 12 week, 25000,  100000)
