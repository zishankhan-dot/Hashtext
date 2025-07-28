import Messages from "../Model/messageModel.js";

// fetch message by looking up at receiver phone number and sender phone number
export const fetchMessages = async (req, res) => {
    let { Receiver } = req.query;
    Receiver = Receiver.trim(); // trim any whitespace

    console.log("Receiver Phone Number:", Receiver);
    console.log("User Data from Token:", req.userData); // Log user data for debugging

    const senderPhoneNumber = req.userData.PhoneNumber;
    if (!Receiver || !senderPhoneNumber) {
        return res.status(400).json({ message: "Please provide receiver phone number or please login, token expired" });
    } 
    else {
        try {
            console.log("Fetching messages for sender:", senderPhoneNumber, "and receiver:", Receiver);

            // Log all messages in the database for both directions
            const allMessagesSenderToReceiver = await Messages.find({ senderNumber: senderPhoneNumber, receiverNumber: Receiver });
            const allMessagesReceiverToSender = await Messages.find({ senderNumber: Receiver, receiverNumber: senderPhoneNumber });
            console.log(`Count sender->receiver: ${allMessagesSenderToReceiver.length}`);
            allMessagesSenderToReceiver.forEach((msg, idx) => {
              console.log(`sender->receiver [${idx}]: sender=${msg.senderNumber}, receiver=${msg.receiverNumber}, text=[encrypted]`);
            });
            console.log(`Count receiver->sender: ${allMessagesReceiverToSender.length}`);
            allMessagesReceiverToSender.forEach((msg, idx) => {
              console.log(`receiver->sender [${idx}]: sender=${msg.senderNumber}, receiver=${msg.receiverNumber}, text=[encrypted]`);
            });

            // Fetching messages from the database that are bidirectional between sender and receiver
            const messages = await Messages.find({
                $or: [
                    { senderNumber: senderPhoneNumber, receiverNumber: Receiver },
                    { senderNumber: Receiver, receiverNumber: senderPhoneNumber }
                ]
            });

            console.log("Fetched messages from database:", messages);
            return res.status(200).json({ messages, senderPhoneNumber });
        } catch (err) {
            console.error("Error fetching messages:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const sendMessage = async (req, res) => {
    const { receiverNumber, encryptedMessageReceiver, encryptedMessageSender } = req.body;
    const senderPhoneNumber = req.userData.PhoneNumber; // getting sender's phone number from the token from previous middleware
    if (!receiverNumber || !encryptedMessageReceiver || !encryptedMessageSender || !senderPhoneNumber) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }   
    else{
        try {
            console.log("EncryptedMessageReceiver:", encryptedMessageReceiver);
            console.log("EncryptedMessageSender:", encryptedMessageSender);
            // Create a new message document
            const newMessage = new Messages({
                userId: req.userData.userId, // assuming userId is in the token received from previous middleware
                senderNumber: senderPhoneNumber,
                receiverNumber: receiverNumber,
                encryptedMessageReceiver: encryptedMessageReceiver,
                encryptedMessageSender: encryptedMessageSender
            });

            // Save the message to the database
            await newMessage.save();

            return res.status(201).json({ message: "Message sent successfully" });
        } catch (err) {
            console.error("Error sending message:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

