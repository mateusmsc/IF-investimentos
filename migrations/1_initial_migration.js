const Migrations = artifacts.require("Migrations");
const Actions = artifacts.require("Actions");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Actions);
};
