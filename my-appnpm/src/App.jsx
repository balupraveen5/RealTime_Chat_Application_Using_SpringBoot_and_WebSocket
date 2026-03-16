import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

let stompClient = null;

export default function Chat() {

  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    connect();
  }, []);

  const connect = () => {
    const socket = new SockJS("http://localhost:8080/chat");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/message", (msg) => {
        const newMessage = JSON.parse(msg.body);

        setChat((prev) => [...prev, newMessage]);
      });
    });
  };

  const sendMessage = () => {

    if (!sender || !message) return;

    const chatMessage = {
      sender: sender,
      content: message,
    };

    stompClient.send(
      "/app/sendMessage",
      {},
      JSON.stringify(chatMessage)
    );

    setMessage("");
  };

  return (
    <div className="flex flex-col items-center p-6">

      <h1 className="text-3xl font-bold mb-4">
        Real Time Chat Application
      </h1>

      <div className="w-full max-w-lg border rounded p-4 h-80 overflow-y-auto mb-4">

        {chat.map((m, i) => (
          <div key={i} className="border-b py-1">
            <span className="font-semibold">{m.sender}</span>: {m.content}
          </div>
        ))}

      </div>

      <input
        type="text"
        placeholder="Enter your name..."
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        className="border p-2 rounded w-full max-w-lg mb-2"
      />

      <div className="flex w-full max-w-lg">

        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 rounded-l w-full"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded-r"
        >
          Send
        </button>

      </div>

    </div>
  );
}