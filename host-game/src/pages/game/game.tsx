import { useEffect } from "react"
import Room from "../../models/Room.model"
import Timer from "../../components/timer/timer"
import { useNavigate } from "react-router-dom"
import './game.css'
import { motion } from "framer-motion"

interface gameProps {
    room: Room,
    endTime: Date | false,
    text: string
}
const Game: React.FC<gameProps> = (props) => {
    const navigate = useNavigate()

    useEffect(() => {
        if (!props.room) {
          navigate('/');
        }
      }, [props.room, navigate]);

    
    return (
        
        <div className="game-container">
            <motion.h1
                key={props.text}
                initial={{ scale: 0.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}>
                {props.text}
            </motion.h1>

            {props.endTime ? <Timer endTime={props.endTime}/> : null}
        </div>
    )
}

export default Game
