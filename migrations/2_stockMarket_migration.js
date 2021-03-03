var StockMarket = artifacts.require('./StockMarket.sol');

module.exports = function(deployer) {
  deployer.deploy(StockMarket);
}