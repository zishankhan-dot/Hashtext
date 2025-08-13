We are also supposed to attack other group, find vulnerabilities and document it henceforth attack report link given below  :-

ATTACK REPORT LINK : https://docs.google.com/document/d/1voifAzPWm1P7PNq5dYQ6tNmKpg4Io6NITTk27NEq3sQ/edit?usp=sharing

Deployed : https://172.187.193.53/authenticate
on Azure vm using nginx and running on https using ssl certificates


## Development Notes & Credits

During the development and debugging of Hashtext, modern AI tools and prior project experience were leveraged to ensure robust and efficient solutions:

- **AI Assistance:**
  - Large Language Models (LLMs) such as OpenAI's GPT and Claude were used at key points for debugging and architectural guidance.
    - For example, GPT was consulted to resolve a semantic issue in MongoDB where the password field was being updated on every `.save()` operation. Console logging and LLM suggestions helped identify and mitigate the problem.
    - Claude was referenced for frontend decryption logic, specifically the approach of fetching all messages and decrypting them based on sender/receiver roles. The final implementation was custom, inspired by the LLM's template and ideas, but not directly copied.
- **Prior Work:**
  - Code and architectural patterns from previous repositories by Zishan were referenced and adapted, including:
    - [HANDI-MERN](https://github.com/zishankhan-dot/HANDI-MERN)
    - [Odeon-Cinema-Charlestown](https://github.com/zishankhan-dot/Odeon-Cinema-Charlestown)


- **README Writing:**
AI assistants were also used to help write and structure few sections of this README file. Unstructured but in-depth prompts were provided to generate clear, structured response, which was carefully reviewed and edited to ensure accuracy, clarity, and authenticity. 

All external code and AI-generated suggestions were carefully reviewed and adapted to fit the unique requirements of this project.

# Hashtext

Hashtext is a secure, end-to-end encrypted messaging application. It features a React frontend and a Node.js/Express backend, using RSA encryption to ensure that only the intended sender and receiver can read messages. MongoDB is used for data storage, and the Web Crypto API is used for cryptographic operations in the frontend. SMS-based OTP verification is used for secure user onboarding.


## Features
- End-to-end encrypted messaging using RSA public/private key pairs
- User registration and login with OTP-based phone verification (via SMSChef)
- Real-time chat experience with polling (auto-refresh every 10 seconds)
- Message history with timestamps
- User-friendly React frontend
- Node.js/Express backend API
- MongoDB for message and user storage


## Assumptions
- Each user generates and stores their own RSA key pair (private key in browser, public key on server)
- Public keys are exchanged and stored on the backend for secure message delivery
- Only the sender and receiver can decrypt their respective messages
- OTP verification is used for secure user registration and login
- SMS delivery is handled by SMSChef and requires a valid API key


## Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn
- MongoDB (local or cloud instance)
- Modern browser with Web Crypto API support (for frontend)
- SMSChef account and API key for OTP delivery

## Project Structure

```
Hashtext/
  Backend/
    main.js
    package.json
    Middleware/
      messageController.js
      sms.js
      userConroller.js
    Model/
      messageModel.js
      userModel.js
    Routes/
      MessageRouter.js
      userRouter.js
  frontend/
    index.html
    index.jsx
    package.json
    api/
    pages/
    public/
    src/
```

## Setup Instructions

### 1. Clone the Repository

```
git clone <repo-url>
cd Hashtext
```

### 2. Backend Setup

```
cd Backend
npm install
```



Create a `.env` file in the `Backend` directory with the following variables:

```
SECRETKEY=your_jwt_secret
PEPPER=your_pepper_string
MONGODB_URI=your_mongodb_connection_string
SMSCHEF_APIKEY=your_smschef_api_key
```


Start the backend server:

```
npm start
```


## SMSChef Integration (OTP Delivery)

Hashtext uses the SMSChef API to send OTPs (One-Time Passwords) to users during registration and login verification. This ensures that only users with access to the provided phone number can complete registration and login.

### How SMSChef Works in Hashtext

1. **User Registration:**
   - When a user registers, the backend generates a random 6-digit OTP using the `randomstring` library.
   - The OTP is hashed (SHA-256) and stored in the database, and the plain OTP is sent to the user's phone number using the SMSChef API.
   - The SMS sending logic is handled in `Backend/Middleware/sms.js`, which reads the `SMSCHEF_APIKEY` from the environment and makes an HTTP request to the SMSChef API endpoint.
   - Example usage in registration:

```js
// Backend/Middleware/userConroller.js (excerpt)
const otp = random.generate({length:6,charset:'numeric'});
const otpHashed = crypto.createHash('SHA256').update(otp).digest('hex');
const text = `OTP FOR HashText : ${otp}`;
await sendSms(PhoneNumber, text); // sendSms uses SMSChef API
```

2. **OTP Verification:**
   - The user enters the OTP received via SMS.
   - The backend hashes the entered OTP and compares it to the stored hash.
   - If valid and not expired, the user is verified and a JWT token is issued.

3. **Security:**
   - The OTP is only valid for a limited time (e.g., 5 minutes).
   - The SMSChef API key is stored in the `.env` file as `SMSCHEF_APIKEY` and never exposed to the frontend or client.
   - All sensitive operations are handled server-side.


```
cd ../frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:PORT` (PORT from .env).


## Usage

1. **Register a new user:** Enter your phone number and other details. You will receive an OTP via SMS (delivered by SMSChef).
2. **Verify your phone:** Enter the OTP to complete registration. If successful, you are logged in and a JWT token is issued.
3. **Key generation:** On first login, your browser generates an RSA key pair. The private key is stored securely in your browser (IndexedDB), and the public key is sent to the backend.
4. **Add contacts:** Add a contact by their phone number. The app fetches their public key for encryption.
5. **Send and receive messages:**
   - Each message is encrypted twice: once with the receiver's public key (so only the receiver can decrypt it) and once with the sender's public key (so the sender can also see their own sent messages).
   - Both encrypted versions are saved in the database, allowing both users to view and decrypt the same message in their chat history.
   - The chat auto-refreshes every 10 seconds to fetch new messages.
6. **Logout and login:** If your session token expires, you will need to log in again using your phone number and OTP.



## Security Notes
- Private keys are never sent to the server; they are stored in the browser (IndexedDB) and never leave the client device.
  - **Why IndexedDB?** IndexedDB is a secure, browser-provided storage mechanism that allows storing large, structured data (like cryptographic keys) securely and persistently on the client side. It is not accessible by the server or other websites, making it ideal for sensitive data like private keys.
- Public keys are stored on the backend for message encryption and are only used to encrypt messages for the intended recipient.
- All messages are encrypted before being sent and can only be decrypted by the intended user.
- OTPs are hashed before storage and are only valid for a short period.


## Troubleshooting
- Ensure MongoDB is running and accessible.
- Make sure your browser supports the Web Crypto API.
- If messages are not appearing, check the backend logs for errors and verify that both users have exchanged public keys.
- If OTP SMS is not received, check your SMSChef account, API key, and backend logs for errors.

## License

MIT

