import React, { Component } from "react";
import "./App.css";

import getWeb3 from "./getWeb3";

class App extends Component {
  state = { web3: null, accounts: null, challenge: null, signature: null };

  async componentDidMount() {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    this.setState({ web3, accounts });
  }

  getChallenge = async () => {
    const { accounts } = this.state;
    const res = await fetch(
      `http://localhost:3001/auth/${accounts[0].toLowerCase()}`
    );
    this.setState({ challenge: await res.json() });
  };

  signChallenge = async () => {
    const { web3, challenge, accounts } = this.state;
    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData",
        params: [challenge, accounts[0]],
        from: accounts[0]
      },
      (error, res) => {
        if (error) return console.error(error);
        this.setState({ signature: res.result });
      }
    );
  };

  verifySignature = async () => {
    const { challenge, signature, accounts } = this.state;
    const res = await fetch(
      `http://localhost:3001/auth/${challenge[1].value}/${signature}`
    );
    const recovered = await res.text();
    if (res.status === 200 && recovered === accounts[0].toLowerCase()) {
      console.log("Signature verified");
    } else {
      console.log("Signature not verified");
    }
  };

  render() {
    const { web3, challenge, signature } = this.state;
    if (!web3) return "Loading...";
    return (
      <div className="App">
        <button onClick={this.getChallenge}>Get Challenge</button>
        <button onClick={this.signChallenge} disabled={!challenge}>
          Sign Challenge
        </button>
        <button onClick={this.verifySignature} disabled={!signature}>
          Verify Signature
        </button>

        {challenge && (
          <div className="data">
            <h2>Challenge</h2>
            <pre>{JSON.stringify(challenge, null, 4)}</pre>
          </div>
        )}

        {signature && (
          <div className="data">
            <h2>Signature</h2>
            <pre>{signature}</pre>
          </div>
        )}
      </div>
    );
  }
}

export default App;
