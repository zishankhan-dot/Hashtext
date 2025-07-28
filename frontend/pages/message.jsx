import React, { useEffect, useState } from "react";
import axios from '../api/axiosInstance';
import { get } from 'idb-keyval';
import './message.css'


// Helper function to import private key from base64
async function importPrivateKey(privateKeyBase64) {
  const binary = atob(privateKeyBase64);
  const arrayBuffer = new Uint8Array([...binary].map(char => char.charCodeAt(0)));
  return window.crypto.subtle.importKey(
    'pkcs8',
    arrayBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['decrypt']
  );
}

// Helper to import public key from base64
async function importPublicKey(publicKeyBase64) {
  const binary = atob(publicKeyBase64);
  const arrayBuffer = new Uint8Array([...binary].map(char => char.charCodeAt(0)));
  return window.crypto.subtle.importKey(
    'spki',
    arrayBuffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  );
}

// Helper to decrypt message
async function decryptMessage(encryptedBase64, privateKey) {
  try {
    console.log("Decrypting message (Base64):", encryptedBase64);
    const encryptedArray = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedArray
    );
    const decryptedText = new TextDecoder().decode(decrypted);
    console.log("Decryption successful. Decrypted text:", decryptedText);
    return decryptedText;
  } catch (error) {
    console.error("Decryption failed. Error details:", error);
    console.error("Encrypted message (Base64):", encryptedBase64);
    console.error("Private key:", privateKey);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

// Helper to encrypt message
async function encryptMessage(message, publicKey) {
  const encoded = new TextEncoder().encode(message);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encoded
  );
  console.log("Encrypted message (Base64):", btoa(String.fromCharCode(...new Uint8Array(encrypted))));
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}


const Message = () => {
  const [messages, setMessages] = useState([]); // decrypted messages
  const [rawMessages, setRawMessages] = useState([]); // raw from backend
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [senderPhoneNumber, setSenderPhoneNumber] = useState("");

  const receiverPhoneNumber = localStorage.getItem('receiverPhoneNumber');

  // Fetch messages and senderPhoneNumber first
  const fetchMessagesAndSender = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/messages/fetchMessage`, {
        params: {
          Receiver: receiverPhoneNumber,
          Sender: senderPhoneNumber
        }
      });
      const { messages, senderPhoneNumber: fetchedSenderPhoneNumber } = res.data;
      if (fetchedSenderPhoneNumber) {
        setSenderPhoneNumber(fetchedSenderPhoneNumber);
      } else {
        console.warn("senderPhoneNumber is not returned by the backend.");
      }
      if (Array.isArray(messages)) {
        console.log('--- All fetched messages sender/receiver ---');
        messages.forEach((msg, idx) => {
          console.log(`Message ${idx}: senderNumber=${msg.senderNumber}, receiverNumber=${msg.receiverNumber}`);
        });
      }
      setRawMessages(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
    setLoading(false);
  }, [receiverPhoneNumber, senderPhoneNumber]);

  // Decrypt messages only when senderPhoneNumber and rawMessages are available
  useEffect(() => {
    const decryptAllMessages = async () => {
      if (!senderPhoneNumber || !Array.isArray(rawMessages) || rawMessages.length === 0) return;
      setLoading(true);
      try {
        const privateKeyBase64 = await get('privateKey');
        const privateKey = await importPrivateKey(privateKeyBase64);
        const decrypted = await Promise.all(
          rawMessages.map(async msg => {
            try {
              let decryptedText;
              console.log('--- Decrypting message ---');
              console.log('msg.senderNumber:', msg.senderNumber);
              console.log('msg.receiverNumber:', msg.receiverNumber);
              console.log('Current user senderPhoneNumber:', senderPhoneNumber);
              if (msg.senderNumber === senderPhoneNumber) {
                console.log('Decrypting as sender (encryptedMessageSender)');
                decryptedText = await decryptMessage(msg.encryptedMessageSender, privateKey);
              } else if (msg.receiverNumber === senderPhoneNumber) {
                console.log('Decrypting as receiver (encryptedMessageReceiver)');
                decryptedText = await decryptMessage(msg.encryptedMessageReceiver, privateKey);
              } else {
                console.warn('Message does not match sender or receiver. Skipping decryption.');
                decryptedText = '[Decryption Skipped]';
              }
              return {
                ...msg,
                text: decryptedText,
              };
            } catch (err) {
              console.error('Decryption failed for message:', msg, err);
              return { ...msg, text: '[Decryption Failed]' };
            }
          })
        );
        setMessages(decrypted);
      } catch (err) {
        console.error('Error decrypting messages:', err);
      }
      setLoading(false);
    };
    decryptAllMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderPhoneNumber, rawMessages]);

  useEffect(() => {
    fetchMessagesAndSender();
    // Poll every 10 seconds for new messages
    const interval = setInterval(() => {
      fetchMessagesAndSender();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchMessagesAndSender]);

  // Send a new message
  const handleSend = async (e) => {
    e.preventDefault();
    try {
      console.log("Starting message send process...");

      const resReceiver = await axios.get(`/User/checkNumber?PhoneNumber=${receiverPhoneNumber}`);
      const receiverPublicKeyBase64 = resReceiver.data.PublicKey;
      console.log("Receiver's public key (Base64):", receiverPublicKeyBase64);
      const receiverPublicKey = await importPublicKey(receiverPublicKeyBase64);

      const resSender = await axios.get('/User/myPublicKey');
      const senderPublicKeyBase64 = resSender.data.PublicKey;
      console.log("Sender's public key (Base64):", senderPublicKeyBase64);
      const senderPublicKey = await importPublicKey(senderPublicKeyBase64);

      const encryptedForReceiver = await encryptMessage(newMsg, receiverPublicKey);
      console.log("Encrypted message for receiver (Base64):", encryptedForReceiver);

      const encryptedForSender = await encryptMessage(newMsg, senderPublicKey);
      console.log("Encrypted message for sender (Base64):", encryptedForSender);

      await axios.post('/messages/sendMessage', {
        receiverNumber: receiverPhoneNumber,
        encryptedMessageReceiver: encryptedForReceiver,
        encryptedMessageSender: encryptedForSender,
      });

      console.log("Message sent successfully.");
      setNewMsg('');
      fetchMessagesAndSender();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="message-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="chat-card">
        <div className="message-list">
          {loading ? <p>Loading...</p> : (
            <ul>
              {[...messages]
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((msg, idx) => {
                  let label = 'Them';
                  let liClass = 'them';
                  if (msg.senderNumber === senderPhoneNumber) {
                    label = 'You';
                    liClass = 'you';
                  }
                  return (
                    <li key={idx} className={liClass}>
                      <b>{label}:</b> {msg.text}
                      <span style={{ fontSize: '0.8em', color: '#888', marginLeft: 8 }}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
        <form onSubmit={handleSend}>
          <input type="text" placeholder="Enter message" value={newMsg} onChange={e => setNewMsg(e.target.value)} required />
          <button type="submit" aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Message;
