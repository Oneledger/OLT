const Web3 = require('web3');
const web3 = new Web3();
const abi = require('./artifacts/ICO.abi').abi;
const bytecode = require('./artifacts/ICO.bytecode').bytecode;

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

const toWei = (eth) => web3.toWei(eth);

const _wallet = '0xd912eD6780306f6Dc09EF60f7279bF2C0E3078b1'; /* var of type address here */ ;
const _rate = 10583; /* var of type uint256 here */ ;
const _startDate = latestTime() + duration.minutes(15); /* var of type uint256 here ~ 12:04:04 Fri 8 Jun 2018 */ ;
const _weiCap = toWei(9085); /* var of type uint256 here */ ;

const icoContract = web3.eth.contract(abi);
const output = icoContract.new.getData(
   _wallet,
   _rate,
   _startDate,
   _weiCap,
   {
     data: bytecode.object,
   })
let constructor = icoContract.new.getData(
   _wallet,
   _rate,
   _startDate,
   _weiCap);

constructor = constructor.substring(9)

console.log('================ CONSTRUCTION START ========================');
console.log(constructor);
console.log('================ CONSTRUCTION END   ========================');

console.log();
console.log();

console.log('================ BYTECODE START ========================');
console.log(output);
console.log('================ BYTECODE END   ========================');
