import { Player } from "../models/player.model.ts"
import { PlayerWebSocket } from "../types/userWebSocket.ts"
import ConnectionService from "./connectionService.ts"

export default class FormattingService {
  connectionService: ConnectionService
  constructor() {
    this.connectionService = ConnectionService.getInstance()
  }

  playerNameToPlayer(playerName: string, roomcode: string): Player {
    const room = this.connectionService.connectedPlayers.get(roomcode)
    const player = room?.get(playerName)?.player
    if (!player) {
      throw new Error(`Player not found: ${playerName} in room: ${roomcode}`)
    }
    return player
  }

  playerListToStringList(playerList: Player[]): string[] {
    return Array.from(playerList).map((player) => player.name)
  }

  mapToPlayerNames(map: Map<string, Player>): string[] {
    return Array.from(map.values()).map((player) => player.name)
  }
  secondsToEndTime(seconds: number): string {
    const now: Date = new Date(new Date().getTime() + (seconds * 1000))
    return now.toISOString()
  }
}
