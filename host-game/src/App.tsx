import { useState, useEffect, useRef } from 'react';
import useWebSocket from "react-use-websocket";
import Titlescreen from './pages/titlescreen/titlescreen';
import Settings from './pages/settings/settings';
import Lobby from './pages/lobby/lobby';
import music from './assets/ominous.mp3';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Room from './models/Room.model';
import MessageData from './types/messageData';
import Game from './pages/game/game';
import Info from './pages/info/Info';


import Environment from "../../Environment.ts"
const environment: Environment = new Environment()
const backendUrl = environment.BACKEND_URL

function App() {
  const [room, setRoom] = useState<Room | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [endTime, setEndTime] = useState<Date | false>(false)
  const [text, setText] = useState<string>('nothing')

  const { sendMessage, lastMessage } = useWebSocket(
    backendUrl + "/start_host_web_socket",
    {
      share: true,
      shouldReconnect: () => false,
    },
  )

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
      })
    }
  }

  useEffect(() => {
    if (lastMessage !== null) {
      const messageData: MessageData = JSON.parse(lastMessage.data);
      console.log("Parsed message data:", messageData);
      if (messageData.room) {
        setRoom(new Room(messageData.room.roomcode, messageData.room.playerList, messageData.room.deviceId));  
      }
      if (messageData.event == 'display') {
        if (messageData.time) {
          setEndTime(new Date(messageData.time!))
        } else {
          setEndTime(false)
        }
        setText(messageData.text!)
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (location.pathname === '/') {
      playAudio();
    }
  }, [location.pathname])


  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="" index element={<Titlescreen />} />
          <Route path="/settings" index element={<Settings musicHandler={playAudio} />} />
          <Route path="/lobby" index element={
            <Lobby 
              sendMessage={sendMessage} 
              room={room} 
              setRoom={setRoom} 
            />
            } />
          <Route path="/game" index element={
            room
            ? <Game room={room} text={text} endTime={endTime} />
            : <h1>no room joined</h1>
          } />
          <Route path="/info" index element={<Info />} />
        </Routes>
      </BrowserRouter>
      <audio ref={audioRef} src={music} loop />
    </>
  )
}


export default App;
