import { ReactNode, useState } from "react";
import Player from "../models/Player.model";

interface VoteComponentProps {
    playerList: Player[],
    disallowedPlayerNames: string[],
    onSubmit: (playerName: string) => void
}
// TODO: voting component should disappear when done voting
const VoteComponent: React.FC<VoteComponentProps> = (props) => {
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

    const listPlayers = (playerList: Player[], disallowedPlayerNames: string[]): ReactNode => {
        let playerButtons: ReactNode[] = []
        for (let player of playerList) {
            const isDisabled = disallowedPlayerNames.includes(player.name)
            const isActive = selectedPlayer === player.name

            if (!isDisabled) {
                playerButtons.push(
                    <button 
                        type="button" 
                        className={`list-group-item list-group-item-action ${isActive ? 'active' : ''}`} 
                        disabled={isDisabled}
                        key={player.name}
                        onClick={() => !isDisabled && setSelectedPlayer(player.name)}>
                        {player.name}
                    </button>
                )
            }
            
        }
        return playerButtons
    }
    
    const handleSubmit = () => {
        if (selectedPlayer) {
            props.onSubmit(selectedPlayer)
        }
    }

    return (
        <>
        <div className="list-group">
            {listPlayers(props.playerList, props.disallowedPlayerNames)}
        </div>
        <br />
        <button 
            className="btn btn-primary form-control" 
            disabled={!selectedPlayer}
            onClick={handleSubmit}
        >
            Vote {selectedPlayer}
        </button>
        </>

    )
}


export default VoteComponent