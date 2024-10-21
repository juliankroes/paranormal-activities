import { Host } from "../models/host.model.ts"
import { HostWebSocket } from "../types/hostWebSocket.ts"
import { PlayerWebSocket } from "../types/userWebSocket.ts"
import ConnectionService from "./connectionService.ts"
import GameLoop from "./gameLoop.ts"

type BroadcastMessage = {
  [key: string]: any
} & {
  event: string
}

export default class GameService {
  private connectionService: ConnectionService

  constructor() {
    this.connectionService = ConnectionService.getInstance()
  }

  informativeMessage(message: string, roomcode: string, playerNames: string[]) {
    const playerSockets: PlayerWebSocket[] = this.connectionService
      .getPlayerSocketsFromNameArray(playerNames, roomcode)

    console.log(`message: ${message} for players ${playerNames}`)
    const infoMessage: BroadcastMessage = {
      event: "informative-message",
      message: message,
    }

    for (const playerSocket of playerSockets) {
      if (playerSocket.readyState === WebSocket.OPEN) {
        playerSocket.send(JSON.stringify(infoMessage))
      }
    }
  }

  inputMessage(
    message: string,
    placeholder: string,
    roomcode: string,
    playerNames: string[],
  ) {
    const playerSockets: PlayerWebSocket[] = this.connectionService
      .getPlayerSocketsFromNameArray(playerNames, roomcode)
    const inputMessage: BroadcastMessage = {
      event: "input-message",
      message: message,
      placeholder: placeholder,
    }

    for (const playerSocket of playerSockets) {
      if (playerSocket.readyState === WebSocket.OPEN) {
        playerSocket.send(JSON.stringify(inputMessage))
      }
    }
  }
  answerMessage(answer: string, playerWebSocket: PlayerWebSocket) {
    const answerMessage: BroadcastMessage = {
      event: "answer-message",
      answer: answer,
      roomcode: playerWebSocket.player.connectedGameCode,
      player: playerWebSocket.player.name
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
      event: 'answer-relay',
      prompt: prompt,
      answer: answer
    }
    this.connectionService.broadcastToHost(relayAnswerMessage, hostSocket)
  }
  display(text: string, time: number, hostSocket: HostWebSocket) {
    const displayMessage: BroadcastMessage = {
      event: 'display',
      text: text,
      time: time
    }
    console.log(`displaying ${text} for ${time} seconds`)
    this.connectionService.broadcastToHost(displayMessage, hostSocket)
  }
  getGameLoopInstanceFromRoomcode(roomcode: string): GameLoop {
    const hostSocket: HostWebSocket = this.connectionService.connectedHosts.get(roomcode)!
    const host: Host = hostSocket.host
    return host.gameLoopInstance!
  }
}
