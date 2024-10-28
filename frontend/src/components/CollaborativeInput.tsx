import { useState } from "react";
import { CollaborativeOutput } from "../types/collaborativeOutput";
import CollaborativeMessage from "./CollaborativeMessage";

interface collaborativeInputProps {
    collaborativeOutput: CollaborativeOutput;
    onSubmit: (answer: string) => void;
}

const CollaborativeInput: React.FC<collaborativeInputProps> = (props) => {
    const [answer, setAnswer] = useState<string>('')
    const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false)
    const [validAnswer, setValidAnswer] = useState<boolean>(true)
    const handleSubmit = () => {
        setAnswerSubmitted(true)
        props.onSubmit(answer)
    }
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        if ((inputValue.length + 1) <= 15) {
            setAnswer(inputValue);
            setValidAnswer(true)
        } else {
            setValidAnswer(false)
        }
    }
    if (answerSubmitted) {
        return (
            <p>you subitted {answer}</p>
        )
    }
    return (
    <>
        <label htmlFor="submit" className="form-label">{props.collaborativeOutput.prompt}</label>
        <CollaborativeMessage collaborativeOutput={props.collaborativeOutput}></CollaborativeMessage>
        <div className="d-flex align-items-center">
            <input type="text" className="form-control me-2" onInput={handleInputChange} />
            <button className="btn btn-primary" type="submit" id="submit" onClick={handleSubmit} disabled={!validAnswer}>submit</button>
        </div>
        {validAnswer? null : <div className="invalid">Try to stay below the character limit</div>}

    </>
  )
}


export default CollaborativeInput