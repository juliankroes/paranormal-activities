import { Host } from "../models/host.model.ts"
import { Player } from "../models/player.model.ts"
import BroadcastMessage from "../types/broadcastMessage.ts"
import { CollaborativeOutput, CollaborativeOutputUtils } from "../types/collaborativeOutput.ts"
import { HostWebSocket } from "../types/hostWebSocket.ts"
import { PlayerWebSocket } from "../types/userWebSocket.ts"
import ConnectionService from "./connectionService.ts"
import FormattingService from "./formattingService.ts"
import GameLoop from "./gameLoop.ts"


export default class GameService {
  private formattingService: FormattingService
  private connectionService: ConnectionService

  constructor() {
    this.formattingService = new FormattingService()
    this.connectionService = ConnectionService.getInstance()
  }

  informativeMessage(message: string, roomcode: string, playerNames: string[]) {
    const playerSockets: PlayerWebSocket[] = this.connectionService
      .getPlayerSocketsFromNameArray(playerNames, roomcode)

    const infoMessage: BroadcastMessage = {
      event: "informative-message",
      message: message,
    }

    this.connectionService.broadcastToPlayers(playerSockets, infoMessage)
  }

  inputMessage(message: string, placeholder: string, roomcode: string, playerNames: string[]) {
    const playerSockets: PlayerWebSocket[] = this.connectionService.getPlayerSocketsFromNameArray(
      playerNames,
      roomcode,
    )
    const inputMessage: BroadcastMessage = {
      event: "input-message",
      message: message,
      placeholder: placeholder,
    }

    this.connectionService.broadcastToPlayers(playerSockets, inputMessage)
  }
  votePlayerMessage(players: Player[], roomcode: string) {
    const playerSockets: PlayerWebSocket[] = this.connectionService.getPlayerSocketsFromNameArray(
      this.formattingService.playerListToStringList(players),
      roomcode,
    )
    const votingMessage: BroadcastMessage = {
      event: "voting-message",
      playerList: players,
      disallowedPlayerNames: [], // TODO: refactor code so that voting message always has players own name as disallowed
    }

    this.connectionService.broadcastToPlayers(playerSockets, votingMessage)
  }
  collaborativeInputMessage(output: CollaborativeOutput, placeholder:string, roomcode: string, spirits: Player[]) {
    const playerNameList: string[] = this.formattingService.playerListToStringList(spirits)
    const playerSockets: PlayerWebSocket[] = this.connectionService.getPlayerSocketsFromNameArray(
      playerNameList,
      roomcode,
    )
    const colInputMessage: BroadcastMessage = {
      event: "collaborative-input-message",
      output: output,
      placeholder: placeholder
    }
    this.connectionService.broadcastToPlayers(playerSockets, colInputMessage)
  }
  answerMessage(answer: string, playerWebSocket: PlayerWebSocket) {
    const answerMessage: BroadcastMessage = {
      event: "answer-message",
      answer: answer,
      roomcode: playerWebSocket.player.connectedGameCode,
      player: playerWebSocket.player.name,
    }
    const roomcode: string = playerWebSocket.player.connectedGameCode
    const host: HostWebSocket | undefined = this.connectionService
      .connectedHosts.get(roomcode)
    if (host) {
      this.connectionService.broadcastToHost(answerMessage, host)
    }
  }
  clear(roomcode: string, playerNames: string[]) {
    const playerSockets: PlayerWebSocket[] = this.connectionService
      .getPlayerSocketsFromNameArray(playerNames, roomcode)

    const infoMessage: BroadcastMessage = {
      event: "clear",
    }

    for (const playerSocket of playerSockets) {
      if (playerSocket.readyState === WebSocket.OPEN) {
        playerSocket.send(JSON.stringify(infoMessage))
      }
    }
  }
  relayAnswerToHost(prompt: string, answer: string, hostSocket: HostWebSocket) {
    const relayAnswerMessage: BroadcastMessage = {
      event: "answer-relay",
      prompt: prompt,
      answer: answer,
    }
    this.connectionService.broadcastToHost(relayAnswerMessage, hostSocket)
  }
  display(text: string, ISOString: string | false, hostSocket: HostWebSocket) {
    const displayMessage: BroadcastMessage = {
      event: "display",
      text: text,
      time: ISOString,
    }
    this.connectionService.broadcastToHost(displayMessage, hostSocket)
  }
  getGameLoopInstanceFromRoomcode(roomcode: string): GameLoop {
    const hostSocket: HostWebSocket = this.connectionService.connectedHosts.get(
      roomcode,
    )!
    const host: Host = hostSocket.host
    return host.gameLoopInstance!
  }
}
