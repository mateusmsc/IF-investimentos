pragma experimental ABIEncoderV2;

/*		
*		
*		Implementação de contrato simples:
*		Para funcionamento deve-se primeiro setar o contrato na 
*		blockchain e depois para realizar a compra, seguir as regras 
*		e pronto, ele mudará de dono e valor, se o valor da compra
*		for maior que o inicial
*
*
*/


contract Actions {
    
    struct Ativo {
        uint256 valor;
        address dono;
        bool vendivel;
    }
    
    mapping (string => Ativo) public ativos;
    
    string [] private nomeAtivo;
    
    function setAtivos(uint256 _valor, bool _vendivel, string memory _nomeAtivo) public {
        
        nomeAtivo.push(_nomeAtivo);
        ativos[_nomeAtivo].valor = _valor;
        ativos[_nomeAtivo].vendivel = _vendivel;
        ativos[_nomeAtivo].dono = msg.sender;
    
    }
    
    function getAtivos () external view returns (string[] memory nomesAtivo) {
        return nomeAtivo;
    }
    
    
    function comprar (string memory _nomeAtivo) public payable {
        require (ativos[_nomeAtivo].vendivel == true, "O ativo nao pode ser vendido ou nao possue nome valido.");
        require (msg.value >= ativos[_nomeAtivo].valor, "O valor precisa ser maior que o preco do ativo.");
        ativos[_nomeAtivo].valor = msg.value;
        ativos[_nomeAtivo].dono = msg.sender;
    }

}