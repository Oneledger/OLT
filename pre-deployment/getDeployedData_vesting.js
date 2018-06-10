const Web3 = require('web3');
const web3 = new Web3();
const abi = require('./artifacts/OneledgerTokenVesting.abi').abi;
const bytecode = require('./artifacts/OneledgerTokenVesting.bytecode').bytecode;

const latestTime = () => {
  const date = new Date();
  return Math.floor(date.getTime() / 1000);
}

const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  years: function (val) { return val * this.days(365); },
};

const [beneficiary, xDaysFromNow, periodInDay, tokenPerPeriod, oneledgerTokenAddress] = process.argv.slice(2);


const contract = web3.eth.contract(abi);
const output = contract.new.getData(
   beneficiary,
   latestTime() + duration.days(xDaysFromNow),
   duration.days(periodInDay),
   tokenPerPeriod,
   oneledgerTokenAddress,
   {
     data: bytecode.object,
   })
let constructor = contract.new.getData(
  beneficiary,
  latestTime() + duration.days(xDaysFromNow),
  duration.days(periodInDay),
  tokenPerPeriod,
  oneledgerTokenAddress);

constructor = constructor.substring(9)

console.log('================ CONSTRUCTION START ========================');
console.log(constructor);
console.log('================ CONSTRUCTION END   ========================');

console.log();
console.log();

console.log('================ BYTECODE START ========================');
console.log(output);
console.log('================ BYTECODE END   ========================');
