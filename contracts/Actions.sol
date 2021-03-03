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


contract Purchase {
    
    struct Ativo {
        uint256 valor;
        address dono;
        bool vendivel;
        string nome;
    }
    
    mapping (uint256 => Ativo) public ativos;
    
    uint256 [] qtdAtivos;
    
    //string [] private nomeAtivo;
    uint256 qtdAtivosCount = 0;
    
    function setAtivos(uint256 _valor, bool _vendivel, string memory _nomeAtivo) public {
        
        qtdAtivos.push(qtdAtivosCount);

        ativos[qtdAtivosCount].valor = _valor;
        ativos[qtdAtivosCount].vendivel = _vendivel;
        ativos[qtdAtivosCount].nome = _nomeAtivo;
        ativos[qtdAtivosCount].dono = msg.sender;
        
        qtdAtivosCount++;
    }
    
    function getAtivos () external view returns (uint256[] memory idsAtivo) {
        return qtdAtivos;
    }
    
    
    function comprar (uint256 _idAtivo) public payable {
        require (ativos[_idAtivo].vendivel == true, "O ativo nao pode ser vendido ou nao possue id valido.");
        require (msg.value >= ativos[_idAtivo].valor, "O valor precisa ser maior que o preco do ativo.");
        ativos[_idAtivo].valor = msg.value;
        ativos[_idAtivo].dono = msg.sender;
        
    }

}