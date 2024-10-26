import { ReactNode, useEffect, useState } from "react";
import "./App.css";
import JoinRoomDetails from "./models/JoinRoomDetails.model.ts";
import useWebSocket from "react-use-websocket";
import MessageData from "./types/messageData.ts";
import Room from "./models/Room.model.ts";
import Start from "./pages/Start.tsx";
import InputMessage from "./components/InputMessage.tsx";
import VoteComponent from "./components/VoteComponent.tsx";

enum GameState {
  Joining,
  Playing,
  Reconnecting,
  End 
}

const backendUrl = "ws://localhost:8080";
// const socketConnection = new WebSocket(backendUrl + "/start_web_socket");

export const App: React.FC = () => {
  const [gameState, setGameState] = useState(GameState.Joining);
  const [room, setRoom] = useState<Room>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [informativeMessage, setInformativeMessage] = useState<string | null>(null);
  const [gameComponent, setGameComponent] = useState<ReactNode | null>(<div>waiting for something interesting to happen</div>)
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    backendUrl + "/start_player_web_socket",
    {
      share: true,
      shouldReconnect: () => false,
    },
  );

  const getDeviceId = () => {
    let deviceId: string | null = localStorage.getItem("deviceId");
    if (!deviceId) {
      let newDeviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", newDeviceId);
      deviceId = newDeviceId;
    }
    return deviceId;
  };

  const joinGameHandler = (joinDetails: JoinRoomDetails) => {
    console.log(`sending: ${joinDetails}`);
    sendMessage(JSON.stringify({
      event: "join-room",
      roomcode: joinDetails.roomcode,
      name: joinDetails.name,
      deviceId: getDeviceId(),
    }))
  }

  const answerHandler = (answer: string) => {
    console.log(`sending: ${answer}`);
    sendMessage(JSON.stringify({
      event: "answer-prompt",
      answer: answer,
    }))
  }
  const voteHandler = (playerName: string) => {
    console.log(`sending: ${playerName}`)
    sendMessage(JSON.stringify({event: "vote-answer", playerName: playerName}))
    setGameComponent('')
  }

  // switch satement with all possible messages from backend
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const messageData: MessageData = JSON.parse(lastMessage.data);
        console.log("Parsed message data:", messageData);
        if (messageData.isError) {
          setErrorMessage(messageData.details!);
          return;
        }
        setErrorMessage(null)

        switch (messageData.event) {
          case "joined-room":
            setRoom(messageData.room);
            setGameState(GameState.Playing)
            break
          case "update-users":
            setRoom(messageData.room)
            setGameState(GameState.Playing)
            break
          case "informative-message":
            setGameComponent(<p>{messageData.message}</p>)
            break
          case "input-message":
            setGameComponent(<InputMessage 
              onSubmit={answerHandler}
              placeholder={messageData.placeholder!} 
              message={messageData.message!}></InputMessage>)
            break
          case "voting-message":
            setGameComponent(
              <VoteComponent 
                playerList={messageData.playerList!} 
                disallowedPlayerNames={messageData.disallowedPlayerNames!}
                onSubmit={voteHandler}>
              </VoteComponent>)
              break
          case "clear":
            setGameComponent(null)
            break
          default:
            console.log('default message')
        }

        
      } catch (error) {
        console.error("Failed to parse message data", error);
      }
    }
  }, [lastMessage]);

  return (
    <div className="container">
    {
      gameState == GameState.Joining 
      ? <Start onJoinRoom={joinGameHandler} errorMessage={errorMessage} />
      : null
    }
    {
      informativeMessage 
      ? <h4>{informativeMessage}</h4>
      : null
    }
    {
      gameState == GameState.Playing
      ? gameComponent
      : null
    }
    </div>
  );
};

export default App;
