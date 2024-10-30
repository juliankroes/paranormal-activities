import { useState } from "react";
import JoinRoomDetails from "../models/JoinRoomDetails.model";
import logo from "../assets/paranormal-logo.png";

interface StartProps {
  onJoinRoom: (JoinRoomDetails: JoinRoomDetails) => void;
  errorMessage: string | null;
}
const Start: React.FC<StartProps> = (props) => {
  // variables
  const maxNameLength: number = 15;
  const maxRoomCodeLength: number = 4;

  const [enteredRoomDetails, setEnteredRoomDetails] = useState<JoinRoomDetails>();
  const [roomcode, setRoomCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [validRoomcode, setValidRoomcode] = useState<boolean>(false);
  const [_validName, setValidName] = useState<boolean>(false);

  const [nameCharacterAmount, setNameCharacterAmount] = useState<number>(0);

  const handlePlayClick = () => {
    setEnteredRoomDetails(new JoinRoomDetails(roomcode, name));
    if (enteredRoomDetails) {
      console.log(roomcode, name);
      props.onJoinRoom(enteredRoomDetails);
    }
  };

  const handleRoomCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.toUpperCase();
    const isAlphabet = (str: string) => /^[A-Z]*$/.test(str);

    if (inputValue.length <= maxRoomCodeLength && isAlphabet(inputValue)) {
      setRoomCode(inputValue);
      if (inputValue.length === maxRoomCodeLength) {
        setValidRoomcode(true);
      } else {
        setValidRoomcode(false);
      }
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setNameCharacterAmount(inputValue.length);

    if ((inputValue.length + 1) <= maxNameLength) {
      setName(inputValue);
      setValidName(true);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center">
        <img src={logo} alt="paranormal activities" className="logo" />
      </div>
      <br />
      <h1>Join a game</h1>
      <hr />
      <label htmlFor="roomcode">Room code:</label>

      <input
        type="text"
        placeholder="enter roomcode"
        className="form-control"
        id="roomcode"
        value={roomcode}
        onChange={handleRoomCodeChange}
      />

      <br />
      <span className="d-flex justify-content-between align-items-center">
        <label htmlFor="name">Name:</label>
        <label>{nameCharacterAmount}/{maxNameLength}</label>
      </span>

      <input
        type="text"
        placeholder="Enter a nickname"
        className="form-control"
        id="name "
        value={name}
        onChange={handleNameChange}
      />

      <br />
      <button
        type="submit"
        onClick={handlePlayClick}
        className="btn btn-primary form-control"
        disabled={!validRoomcode || name.length < 1}
      >
        play
      </button>
      <br/>
      <br/>
      {props.errorMessage
        ? (
          <div className="alert alert-danger" role="alert">
            {props.errorMessage}
          </div>
        )
        : null}
    </div>
  );
};

export default Start;
