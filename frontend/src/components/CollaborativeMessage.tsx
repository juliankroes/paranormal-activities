import { CollaborativeOutput } from "../types/collaborativeOutput";

interface CollaborativeMessageProps {
    collaborativeOutput: CollaborativeOutput;
}

const collaborativeMessage: React.FC<CollaborativeMessageProps> = ({collaborativeOutput}) => {
    return (
        <div className="d-inline-flex justify-content-center coll-message-container">
            {collaborativeOutput.fullOutput.map(({ player, output }, index) => (
            <div key={index} className="d-inline-flex flex-column">
                <span className="badge bg-secondary">{player.name}</span> 
                <span>
                {output == '' ? '...' : output}
                </span>
            </div>
            ))}
        </div>
    )
}

export default collaborativeMessage