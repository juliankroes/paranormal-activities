import { Host } from "../models/host.model.ts"
import ConnectionService from "../services/connectionService.ts"
import GameLoop from "../services/gameLoop.ts"
import GameService from "../services/gameService.ts"
import { HostWebSocket } from "../types/hostWebSocket.ts"

import {
  AnswerMessage,
  ClearMessage,
  InformativeMessage,
  InputMessage,
  StartGameMessage,
  VoteAnswer,
} from "../types/messages.ts"
import { PlayerWebSocket } from "../types/userWebSocket.ts"
// TODO: export redundant GameController code to a service
export default class GameController {
  
  gameService: GameService
  connectionService: ConnectionService
  constructor() {
    this.gameService = new GameService()
    this.connectionService = ConnectionService.getInstance()
  }

  startGameLoop(data: StartGameMessage) {
    const hostSocket = this.connectionService.connectedHosts.get(data.roomcode)
    const roomcode: string = data.roomcode
    const gameloop: GameLoop = new GameLoop(roomcode)
    hostSocket!.host.gameLoopInstance = gameloop
    gameloop.main()
  }

  informativeMessage(data: InformativeMessage) {
    this.gameService.informativeMessage(
      data.message,
      data.roomcode,
      data.playerNameArray,
    )
  }

  clearMessage(data: ClearMessage) {
    this.gameService.clear(data.roomcode, data.playerNameArray)
  }

  inputMessage(data: InputMessage) {
    this.gameService.inputMessage(
      data.message,
      data.placeholder,
      data.roomcode,
      data.playerNameArray,
    )
  }
  answerPrompt(data: AnswerMessage, playerWebSocket: PlayerWebSocket) {
    const connectedGamecode: string = playerWebSocket.player.connectedGameCode
    const gameLoop: GameLoop = this.gameService.getGameLoopInstanceFromRoomcode(
      connectedGamecode,
    )
    gameLoop.handlePlayerInput(playerWebSocket.player.name, data.answer)
  }
  voteAnswer(data: VoteAnswer, playerWebSocket: PlayerWebSocket) {
    const connectedGamecode: string = playerWebSocket.player.connectedGameCode
    const gameLoop: GameLoop = this.gameService.getGameLoopInstanceFromRoomcode(
      connectedGamecode,
    )
    
  }
}
