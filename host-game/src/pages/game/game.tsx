import { useEffect, useState } from "react"
import Room from "../../models/Room.model"
import Timer from "../../components/timer/timer"
import { useNavigate } from "react-router-dom"
import './game.css'


interface gameProps {
    room: Room,
    endTime: Date | null,
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
            <h1>{props.text}</h1>
            {props.endTime ? <Timer endTime={props.endTime}/> : null}
        </div>
    )
}

export default Game
