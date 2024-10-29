export interface BaseMessage {
  event: string
  deviceId: string
}

export interface JoinRoomMessage extends BaseMessage {
  event: "join-room"
  name: string
  roomcode: string
}

export interface StartGameMessage extends BaseMessage {
  event: "start-game"
  roomcode: string
}

export interface LeaveRoomMessage extends BaseMessage {
  event: "leave-room"
}

export interface CreateRoomMessage extends BaseMessage {
  event: "create-room"
}
export interface InformativeMessage extends BaseMessage {
  event: "informative-message"
  message: string
  playerNameArray: string[]
  roomcode: string
}
export interface ClearMessage extends BaseMessage {
  event: "clear-message"
  playerNameArray: string[]
  roomcode: string
}
export interface InputMessage extends BaseMessage {
  event: "input-message"
  playerNameArray: string[]
  roomcode: string
  message: string
  placeholder: string
}

export interface AnswerMessage extends BaseMessage {
  event: "answer-prompt"
  answer: string
}
export interface CollaborativeAnswerMessage extends BaseMessage {
  event: "collaborative-answer"
  answer: string
}
export interface VoteAnswer extends BaseMessage {
  event: "vote-answer"
  playerName: string
}

export type Message =
  | StartGameMessage
  | JoinRoomMessage
  | LeaveRoomMessage
  | CreateRoomMessage
  | InformativeMessage
  | ClearMessage
  | InputMessage
  | AnswerMessage
  | CollaborativeAnswerMessage
