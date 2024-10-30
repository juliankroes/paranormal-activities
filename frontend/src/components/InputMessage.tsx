import { useState } from "react";
import Player from "../models/Player.model";

interface InputMessageProps {
  message: string;
  placeholder: string;
  onSubmit: (answer: string) => void;
}
const InputMessage: React.FC<InputMessageProps> = (props) => {
    const [answer, setAnswer] = useState<string>('')
    const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false)
    const [validAnswer, setValidAnswer] = useState<boolean>(true)

    const handleSubmit = () => {
        setAnswerSubmitted(true)
        props.onSubmit(answer)
    }
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;

        if ((inputValue.length + 1) <= 30) {
            setAnswer(inputValue)
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
        <label htmlFor="submit" className="form-label">{props.message}</label>
        <div className="d-flex align-items-center">
            <input type="text" className="form-control me-2" onInput={handleInputChange} placeholder={props.placeholder} />
            <button className="btn btn-primary" type="submit" id="submit" onClick={handleSubmit} disabled={!validAnswer}>submit</button>
        </div>
        {validAnswer? null : <div className="invalid">Try to stay below the character limit</div>}

    </>
  )
}

export default InputMessage;
