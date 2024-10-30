import logo from '../../assets/images/paranormal-logo.png';
import { motion } from "framer-motion";
import './lobby.css';
import { useEffect } from 'react';
import Room from '../../models/Room.model';
import { Link, useNavigate } from 'react-router-dom';
import PlayerList from '../../components/playerList/PlayerList'
import { SendMessage } from 'react-use-websocket';
import { getDeviceId } from '../utils/deviceUtils';

type LobbyProps = {
  sendMessage: SendMessage
  room: Room | null
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>
}

const Lobby: React.FC<LobbyProps> = ({ sendMessage, room }) => {
  const navigate = useNavigate()
  const hover = {
    y: [-15, -35, 0, -30, 0, -15],
    rotate: [0, 5, -5, -5, 5, 0],
    color: ['black', 'black', 'crimson', 'crimson']
  };

  const hoverTransition = {
    duration: 12,
    ease: "easeInOut",
    repeat: Infinity
  };

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        event: "create-room",
        deviceId: getDeviceId(),
      })
    )
  }, [sendMessage])

  const handlePlayClick = () => {
    sendMessage(JSON.stringify({
      event: "start-game",
      roomcode: room!.roomcode,
    }))
    navigate('/game')
  }

  if (!room) {
    return(
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>)
  }

  return (
    <div className="d-flex align-items-center flex-column">
    <Link to="/">back to home</Link>
      <img src={logo} alt="" className='main-logo' />
      <div className='d-flex justify-content-space-evenly'>
        <h1>enter room code: </h1>
        <motion.h1 
          animate={hover}
          transition={hoverTransition}
          className='room-code'>
          {room!.roomcode}
        </motion.h1>
      </div>
      <br />
      <button className='btn btn-dark' onClick={handlePlayClick}>
            Play
        </button>
        <PlayerList players={room.playerList}></PlayerList>
    </div>
  );
};

export default Lobby;
