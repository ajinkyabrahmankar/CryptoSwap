import React, { Component } from 'react';
import './App.css';
import Navbar from './Navbar';
import Main from './Main';
import CryptoSwap from '../abis/CryptoSwap.json';
import Token from '../abis/Token.json';
import Web3 from 'web3';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()    
    this.setState({ account: accounts[0] })

    const getAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
   };
   getAccount();

    let ethBalance = await web3.eth.getBalance(accounts[0]);
    this.setState({ ethBalance: ethBalance });

    //Load Token
    const abi = Token.abi;
    const networkId = await web3.eth.net.getId();//returns 5777 for ganache    
    const tokenData = Token.networks[networkId]
    if (tokenData) {
      const address = tokenData.address
      const token = new web3.eth.Contract(abi, address)
      this.setState({ token: token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      //This fails incase we are on the wrong network
      window.alert('Token contract not deployed to detected network')
    }

    //Load CryptoSwap
    const abi2 = CryptoSwap.abi;
    const cryptoSwapData = CryptoSwap.networks[networkId]
    if (cryptoSwapData) {
      const address = cryptoSwapData.address
      const cryptoSwap = new web3.eth.Contract(abi2, address)
      this.setState({ cryptoSwap: cryptoSwap })
    } else {
      //This fails incase we are on the wrong network
      window.alert('CryptoSwap contract not deployed to detected network')
    }

    this.setState({ loading: false })

  }

  async loadWeb3() {
    if (window.web3) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })  
    this.state.cryptoSwap.methods.buyTokens()
      .send({ value: etherAmount, from: this.state.account })
      .on('transactionHash', (hash) => {     
        this.setState({ loading: false })
      })
    console.log('after buying tokens')
  }
  
  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.cryptoSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {  
        this.state.cryptoSwap.methods.sellTokens(tokenAmount)
          .send({ from: this.state.account })
          .on('transactionHash', (hash) => {            
            this.setState({ loading: false })
          })
      })
  }  
  
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      cryptoSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      home: true
    }
  }


  render() {
    let content
    if (this.state.loading) {
      content = <a id="loader" className="text-center">Loading...</a>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
