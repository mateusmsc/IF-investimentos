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


  render: function () {
    var stockMarketInstance;
    var titlesGrid = $('#titlesGrid');

    //verifica em qual página estamos antes de executar as funções da blockchain
    if(window.location.pathname == "/minhas-acoes.html"){
      return App.minhasAcoes();
    }
    else if(window.location.pathname == "/home.html"){
      // Captura o endereço da conta conectada
      web3.eth.getCoinbase(function (err, account) {
        if (err === null) {
          App.account = account;

          var connectedAccount = $("#connected-account");
          // connectedAccount.append("Conta conectada: "+account);
        }
      });

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
    }
    
  },


  minhasAcoes: function(){
    var ativosByAccount, id,valor,owner,status,name;
    var $productsGrid = $('#productsGrid');

    App.contracts.StockMarket.deployed().then(function(instance) {
      ativosByAccount = instance;
      return ativosByAccount.getAtivosByAccount.call();
    }).then(function(result) {
      for(let i=0;i<result.length;i++){
        var myAtive = result[i].c[0];//pegar id do ativo
        ativosByAccount.ativos(myAtive).then(function (ativo){
          var titleTemplate = $('#titleTemplate');
          id = ativo[0].c[0];
          valor = ativo[1].c[0];
          owner = ativo[2];
          status = ativo[3];
          nome = ativo[4];

          titleTemplate.find(".titleName").text(nome);
          titleTemplate.find(".titlePrice").text(valor + " ETH");
          titleTemplate.find(".titleOwner").text(App.formatAddress(owner));
          if(status == true){
            titleTemplate.find(".habilitar").attr("disabled");
            titleTemplate.find(".desabilitar").attr("enabled");
            titleTemplate.find(".habilitar").css("display","none");
            titleTemplate.find(".desabilitar").css("display","block");
          }else{
            titleTemplate.find(".habilitar").attr("enabled");
            titleTemplate.find(".desabilitar").attr("disabled");
            titleTemplate.find(".habilitar").css("display","block");
            titleTemplate.find(".desabilitar").css("display","none");
          }
          var nome1 = $("<div>"+nome+"</div>");
          $productsGrid.append(titleTemplate.html());
        });
      }
    }).catch(function(err) {
      console.log("getAtivosByAccount:" + err.message);
    });
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
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
