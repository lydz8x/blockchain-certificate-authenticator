import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "./contracts/CertificateAuthenticator.json";
import "./App.css";

const contractAddress = "YOUR_CONTRACT_ADDRESS";

function App() {
  const [account, setAccount] = useState(null);
  const [ownerName, setOwnerName] = useState("");
  const [description, setDescription] = useState("");
  const [certificateHash, setCertificateHash] = useState("");
  const [retrievedCert, setRetrievedCert] = useState(null);
  const [txHash, setTxHash] = useState("");

  // connect wallet
  async function connectWallet() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      alert("MetaMask not found!");
    }
  }

  // disconnect wallet
  function disconnectWallet() {
    setAccount(null);
    setCertificateHash("");
    setRetrievedCert(null);
    setTxHash("");
  }

  // get contract
  async function getContract(signer = true) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (signer) {
      const signerObj = await provider.getSigner();
      return new ethers.Contract(contractAddress, contractABI, signerObj);
    }
    return new ethers.Contract(contractAddress, contractABI, provider);
  }

  // create certificate
  async function createCertificate() {
    const contract = await getContract(true);
    const tx = await contract.createCertificate(ownerName, description);
    const receipt = await tx.wait();
    const certHash = receipt.logs[0].args.certificateHash;

    setCertificateHash(certHash);
    setTxHash(tx.hash);
  }

  // get certificate by hash
  async function getCertificate() {
    const contract = await getContract(false);
    const cert = await contract.getCertificate(certificateHash);
    setRetrievedCert(cert);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8 space-y-8">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Certificate Authenticator
        </h1>

        {/* Wallet connection */}
        <div className="flex justify-between items-center">
          {!account ? (
            <button
              onClick={connectWallet}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex flex-col space-y-2">
              <p className="text-gray-700 text-md break-all">
                Connected: {account}
              </p>
              <button
                onClick={disconnectWallet}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Create Certificate */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Create Certificate
          </h2>
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            placeholder="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={createCertificate}
            className="w-full px-4 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition"
          >
            Create
          </button>

          {certificateHash && (
            <p className="text-md text-gray-700 break-all">
              <b>Certificate Hash:</b> {certificateHash}
            </p>
          )}
          {txHash && (
            <p className="text-md text-gray-700 break-all">
              <b>Transaction:</b>{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {txHash}
              </a>
            </p>
          )}
        </div>

        {/* Get Certificate */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Get Certificate
          </h2>
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
            placeholder="Certificate Hash"
            value={certificateHash}
            onChange={(e) => setCertificateHash(e.target.value)}
          />
          <button
            onClick={getCertificate}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Retrieve
          </button>

          {retrievedCert && (
            <div className="bg-gray-50 p-4 rounded-lg border space-y-1">
              <p>
                <b>Owner:</b> {retrievedCert[0]}
              </p>
              <p>
                <b>Owner Name:</b> {retrievedCert[1]}
              </p>
              <p>
                <b>Description:</b> {retrievedCert[2]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
