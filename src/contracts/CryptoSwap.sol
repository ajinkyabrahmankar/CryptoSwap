//// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;

import "./Token.sol";

contract CryptoSwap {
    string public name = "CryptoSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );
    //Note that in the above event we have mentioned about address token
    //it is done in order to point to the purchase of which token
    //here we have only one token as of now which is the DApp token
    //But there might be various tokens. Hence the address token points
    //to the address of the purchased token.

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        //Redemption rate = no. of tokens they recieve for 1 ether
        //Amount of Ethereum * Redemption rate
        //Calculate the number of tokens to buy
        uint tokenAmount = msg.value * rate;

        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient balance");

        token.transfer(msg.sender, tokenAmount);

        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        //User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount, "Insufficient user balance");

        //Calculate the amount of Ether to redeem
        uint etherAmount = _amount / rate;

        //Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount,"Not enough ether");

        //Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        //This function transfers the etherAmount to the msg.sender
        msg.sender.transfer(etherAmount);

        //Emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}