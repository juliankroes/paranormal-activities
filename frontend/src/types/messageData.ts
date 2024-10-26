
import Player from "../models/Player.model";
import Room from "../models/Room.model";

export default interface MessageData {
    event: string;
    room?: Room;
    player?: Player;
    isError?: boolean;
    details?: string;
    message?: string;
    placeholder?: string;
    playerList?: Player[];
    disallowedPlayerNames?: string[];
  }