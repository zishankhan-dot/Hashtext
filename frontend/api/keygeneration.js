import {set} from 'idb-keyval'


//generates a key pair for RSA-OAEP assymetric encryption
export const generateKey = async () => {
    let PublicKeyArrayBuffer=null
    try{
        const keyPair=await window.crypto.subtle.generateKey({
            name:'RSA-OAEP',
            modulusLength: 4096,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256'

        }, true, ['encrypt', 'decrypt']);


    //exporting the private key in pkcs8 format
    const exportedPrivateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    //converting private key to base64 format
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPrivateKey)));
        //save the private key in indexedDB
    await set ('privateKey', privateKeyBase64)
    

    //public key in spki format
    const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    //converting public key to array buffer 
    PublicKeyArrayBuffer = ArrayBufferToBase64(publicKey);



    }
    catch(err){
        console.error('Error generating key:', err);
        throw err 
    }
    return PublicKeyArrayBuffer;
}

const ArrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
};




