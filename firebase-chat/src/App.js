import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  where,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import "./App.css";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState("Community");
  const [contacts, setContacts] = useState(["Community"]);

  // Sign In with Google
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      setUser(loggedInUser);

      const userRef = doc(db, "users", loggedInUser.email);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: loggedInUser.email,
          name: loggedInUser.displayName,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Sign Out
  const handleSignOut = () => {
    signOut(auth);
    setUser(null);
  };

  // Fetch Contacts (Including Community Members)
  useEffect(() => {
    if (!user) return;

    const contactsQuery = query(collection(db, "messages"));

    const unsubscribe = onSnapshot(contactsQuery, (snapshot) => {
      const uniqueContacts = new Set(["Community"]);

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.from !== user.email && data.to !== "Community") {
          uniqueContacts.add(data.from);
        }
        if (data.to !== user.email && data.to !== "Community") {
          uniqueContacts.add(data.to);
        }
        if (data.to === "Community" && data.from !== user.email) {
          uniqueContacts.add(data.from);
        }
      });

      setContacts([...uniqueContacts]);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Messages (Community & Private Chats)
  useEffect(() => {
    if (!user) return;

    let messagesQuery;
    if (selectedChat === "Community") {
      messagesQuery = query(
        collection(db, "messages"),
        where("to", "==", "Community"),
        orderBy("timestamp", "asc")
      );
    } else {
      messagesQuery = query(
        collection(db, "messages"),
        where("to", "in", [user.email, selectedChat]),
        where("from", "in", [user.email, selectedChat]),
        orderBy("timestamp", "asc")
      );
    }

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [user, selectedChat]);

  // Send Message
  const sendMessage = async () => {
    if (!inputText.trim() || !user || !selectedChat) return;

    await addDoc(collection(db, "messages"), {
      text: inputText,
      from: user.email,
      to: selectedChat,
      timestamp: serverTimestamp(),
    });

    setInputText("");
  };

  return (
    <div className="app">
      {!user ? (
        <div className="welcome-container">
          <p className="welcome-text">Welcome to Chat App</p>
          <button onClick={handleSignIn}>Sign in with Google</button>
        </div>
      ) : (
        <>
          <div className="header">
            <button className="signout-btn" onClick={handleSignOut}>
              Sign Out
            </button>
            <h2>Welcome, {user.displayName}</h2>
          </div>

          {/* Chat Layout */}
          <div className="chat-container">
            <div className="contacts">
              <h3>Chats</h3>
              {contacts.map((contact) => (
                <button
                  key={contact}
                  className={`contact ${selectedChat === contact ? "active" : ""}`}
                  onClick={() => setSelectedChat(contact)}
                >
                  {contact}
                </button>
              ))}
            </div>

            {/* Chat Window */}
            <div className="chat-window">
              <h3>Chat with {selectedChat}</h3>
              <div className="chat">
                {messages.map((msg, index) => (
                  <p key={index} className={`message ${msg.from === user.email ? "sent" : "received"}`}>
                    <strong>{msg.from}:</strong> {msg.text}
                  </p>
                ))}
              </div>

              {/* Send Message Section */}
              <div className="send-message">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
