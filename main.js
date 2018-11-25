// Add imports here
const BIP39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');
const Wallet = require('ethereumjs-wallet');
const keccak256 = require('js-sha3').keccak256;
const EthereumTx = require('ethereumjs-tx');

// Add functions here

//Generate random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bites of entropy
function generateMnemonic() {
    return BIP39.generateMnemonic();
}

//Validate the mnemonic becauase not all xters are valid mnemonics
let isValid = BIP39.validateMnemonic();

//Generate the seed from the mnemonic
function generateSeed(mnemonic) {
    return BIP39.mnemonicToSeed(mnemonic);
}

//Generate private key
function generatePrivKey(mnemonic) {
    const seed = generateSeed(mnemonic);
    return hdkey.fromMasterSeed(seed).derivePath(`m/44'/60'/0'/0/0`).getWallet().getPrivateKey();
}

//Derive public key from private key
function derivePubKey(privKey) {
    const wallet = Wallet.fromPrivateKey(privKey);
    return wallet.getPublicKey();
}

/**
 * DERIVING THE ADDRESS
 */
function deriveEthAddress(pubKey) {
    const address = keccak256(pubKey); //keccak hash of the publicKey
    //get the last 20 bytes of the publicKey
    return "0x" + address.substring(address.length - 40, address.length);
}

//Sign Transactions
function signTx(privKey, txData) {
    const tx = EthereumTx(txData);
    tx.sign(privKey);
    return tx;
}

//Get sender/signer address
function getSignerAddress(signedTx) {
    return "0x" + signedTx.getSenderAddress().toString('hex');
}

/*

Do not edit code below this line.

*/

var mnemonicVue = new Vue({
    el:"#app",
    data: {
        mnemonic: "",
        privKey: "",
        pubKey: "",
        ETHaddress: "",
        sampleTransaction: {
            nonce: '0x00',
            gasPrice: '0x09184e72a000',
            gasLimit: '0x2710',
            to: '0x31c1c0fec59ceb9cbe6ec474c31c1dc5b66555b6',
            value: '0x10',
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
            chainId: 3
        },
        signedSample: {},
        recoveredAddress: ""
    },
    methods:{
        generateNew: function(){
            this.mnemonic = generateMnemonic()
        },
        signSampleTx: function(){
            this.signedSample = signTx(this.privKey, this.sampleTransaction)
            console.log("signed Sample", this.signedSample)
        }
    },
    watch: {
        mnemonic: function(val){
            this.privKey = generatePrivKey(val)
        },
        privKey: function(val){
            this.pubKey = derivePubKey(val)
        },
        pubKey: function(val){
            this.ETHaddress = deriveEthAddress(val)
            this.recoveredAddress = ""
        },
        signedSample: function(val){
            this.recoveredAddress = getSignerAddress(val)
        }
    }
})
