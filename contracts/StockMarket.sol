pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;
/*        
*        
*        Implementação de contrato simples:
*        Para funcionamento deve-se primeiro setar o contrato na 
*        blockchain e depois para realizar a compra, seguir as regras 
*        e pronto, ele mudará de dono e valor, se o valor da compra
*        for maior que o inicial
*
*
*/
contract StockMarket {
    
    struct Ativo {
        uint id;
        uint valor;
        address payable dono;
        bool vendivel;
        string name;
    }
    
    uint public ativosCount = 0;
    
    mapping (uint => Ativo) public ativos;
    
   constructor() public{
       createAtivo("ITSA", 20,true);
       createAtivo("ITSA2", 20,true);
       createAtivo("ITSA3", 20,true);
       createAtivo("Teste Dany", 40,true);
       createAtivo("BBDC4", 35,true);
       createAtivo("PETR4", 18,false);
   }
    
    function createAtivo(string memory _nomeAtivo, uint _valor, bool status) public{
        ativosCount++;
        
        ativos[ativosCount] = Ativo(ativosCount, _valor, msg.sender, status, _nomeAtivo);
    }
    
    
    /*TODO: aparentemente solidity não permite retornar structs. Conferir isso.*/
    function getAtivosByAccount() public returns(uint[] memory) {
        address owner = msg.sender;
        
        uint ownerAtivosCount = 0; 
        
        // Verifica quantas ações a conta possui
        for(uint i = 0; i <= ativosCount; i++){
            if(ativos[i].dono == owner){
                ownerAtivosCount++;
            }
        }
        //Ativo[] memory ownerAtivos = new Ativo[](ownerAtivosCount);
        uint[] memory id = new uint[](ownerAtivosCount);
        uint j = 0;
        
        for(uint i = 0; i < ativosCount && j < ownerAtivosCount; i++){
            if(ativos[i].dono == owner){
                id[j]= ativos[i].id;
                //Ativo storage a = ativos[i];
                //ownerAtivos[j] = a;
                j++;
            }
        }  
        //return ownerAtivos
        return id;
    }
    
    
    function comprar(uint ativoIndex) public payable {
        Ativo memory _ativo = ativos[ativoIndex];
        
        address payable _ativoOwner = _ativo.dono;
        
        require (_ativo.vendivel == true, "O ativo nao pode ser vendido ou nao possue nome valido.");
        require (msg.value >= _ativo.valor, "O valor precisa ser maior que o preco do ativo.");
        
       _ativo.dono = msg.sender;
       _ativo.vendivel = false;
       
       ativos[ativoIndex] = _ativo;
       _ativoOwner.transfer(msg.value);
    }

}