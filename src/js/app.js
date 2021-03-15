App = {
  web3Provider: null,
  account: '0x0',
  contracts: {},

  init: function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      window.ethereum.enable();
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("StockMarket.json", function (stockMarket) {
      App.contracts.StockMarket = TruffleContract(stockMarket);
      App.contracts.StockMarket.setProvider(App.web3Provider);

      return App.render();
    });
  },

  formatAddress: function (address) {
    var addressFormated = address;

    addressFormated = addressFormated.substr(2, 4) + "..." + addressFormated.substr(addressFormated.length - 4);

    return addressFormated;
  },

  getUserTitles: function() {
    var stockMarketInstance;
    var productsGrid = $('#productsGrid');

    App.contracts.StockMarket.deployed()
      .then(function (instance) {
        stockMarketInstance = instance;
        return stockMarketInstance.ativosCount();
      })
      .then(function (ativosCount) {
        console.log(ativosCount.c[0]);
        for (let i = 1; i <= ativosCount.c[0]; i++) {
          stockMarketInstance.ativos(i)
            .then(function (ativo) {
              var icon = document.createElement("img");
              var productTemplate = $('#productTemplate');

              var id = ativo[0].c[0];
              var value = ativo[1].c[0];
              var owner = ativo[2];
              var isAvailable = ativo[3];
              var name = ativo[4];

              // Só exibe se o dono do titulo for o usuario ativo
              if (owner === App.account) {
                icon.setAttribute('src', !isAvailable ? './icons/store-solid.svg' : './icons/store-slash-solid.svg');
                icon.setAttribute('alt', 'store icon');
                icon.setAttribute('class', 'buttonIcon');

                productTemplate.find(".titleName").text(name);
                productTemplate.find(".titlePrice").text(value + " ETH");
                productTemplate.find(".titleOwner").text(App.formatAddress(owner));
                productTemplate.find("button").attr('data-id', id);
                productTemplate.find("button").attr('data-price', value);
                productTemplate.find("button").text(isAvailable ? "Desabilitar venda" : "Habilitar venda");
                productTemplate.find("button").append(icon);

                productsGrid.append(productTemplate.html());
              }
            })
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // Adiciona o evento onClick, nos botões, para
    // ser executada a função changeAvailability(),
    // e assim alternar a disponibilidade do ativo
    $(document).on('click', '.btn-buy', App.changeAvailability);
  },

  getAvaiableTitles: function(){
    var stockMarketInstance;
    var titlesGrid = $('#titlesGrid');

    App.contracts.StockMarket.deployed()
      .then(function (instance) {
        stockMarketInstance = instance;
        return stockMarketInstance.ativosCount();
      })
      .then(function (ativosCount) {
        console.log(ativosCount.c[0]);
        for (let i = 1; i <= ativosCount.c[0]; i++) {
          stockMarketInstance.ativos(i)
            .then(function (ativo) {
              var titleTemplate = $('#titleTemplate');

              var id = ativo[0].c[0];
              var value = ativo[1].c[0];
              var owner = ativo[2];
              var isAvailable = ativo[3];
              var name = ativo[4];

              // Se o título não está ativo ele não será exibido
              if (!isAvailable) {
                return;
              }

              console.log(id, value, owner, isAvailable, name);

              titleTemplate.find(".titleName").text(name);
              titleTemplate.find(".titlePrice").text(value + " ETH");
              titleTemplate.find(".titleOwner").text(App.formatAddress(owner));
              titleTemplate.find("button").attr('data-id', id);
              titleTemplate.find("button").attr('data-price', value);

              titlesGrid.append(titleTemplate.html());

            })
        }
      })
      .catch((error) => {
        console.log(error);
      });

    // Adiciona o evento onClick, nos botões de compra, para
    // ser executada a função handleBuy();
    $(document).on('click', '.btn-buy', App.handleBuy);
  },

  render: function () {
    // Captura o endereço da conta conectada
    web3.eth.getCoinbase(function (err, account) {
      var connectedAccount = $("#connected-account");

      if (err === null) {
        App.account = account;
        connectedAccount.append("Conta conectada: "+ App.formatAddress(account));
      }
      else {
        console.log(err);
        connectedAccount.append("Nenhuma conta conectada");
      }
    });

    if(window.location.pathname === '/minhas-acoes.html'){
      App.getUserTitles();
    }

    if(window.location.pathname === '/home.html'){
      App.getAvaiableTitles();
    }
    
  },

  handleBuy: function (event) {
    event.preventDefault();

    var titleId = parseInt($(event.target).data('id'));
    var titlePrice = parseInt($(event.target).data('price'));

    App.contracts.StockMarket.deployed()
      .then(function (instance) {
        stockMarketInstance = instance;
        return stockMarketInstance.comprar(titleId, { from: App.account, value: web3.toWei(titlePrice, 'ether') });
      })
      .then(function (result) {
        location.reload();
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  changeAvailability: function(event) {
    event.preventDefault();

    var titleId = parseInt($(event.target).data('id'));

    App.contracts.StockMarket.deployed()
    .then(function (instance) {
      stockMarketInstance = instance;
      return stockMarketInstance.changeAtivoAvailability(titleId, {from: App.account});
    })
    .then(function (result) {
      location.reload();
    })
    .catch(function (error) {
      console.log(error);
    });
  }

};


$(function () {
  $(window).load(function () {
    App.init();
  });
});