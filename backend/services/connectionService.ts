import { Room } from "../models/room.model.ts"
import { Player } from "../models/player.model.ts"
import { PlayerWebSocket } from "../types/userWebSocket.ts"
import BroadcastMessage from "../types/broadcastMessage.ts"
import { HostWebSocket } from "../types/hostWebSocket.ts"
import { Host } from "../models/host.model.ts"

/*
    connected clients data structure:
[
    [ROOMCODE1 : [
        [PLAYERNAME : SOCKET],
        [PLAYERNAME : SOCKET]
        ]
    ],
    [ROOMCODE2 : [
        [PLAYERNAME : SOCKET],
        [PLAYERNAME : SOCKET]
        ]
    ]
]
    */

export default class ConnectionService {
  private static instance: ConnectionService
  connectedPlayers: Map<string, Map<string, PlayerWebSocket>> = new Map()
  connectedHosts: Map<string, HostWebSocket> = new Map()

  private constructor() {
    this.connectedPlayers = new Map()
    this.connectedHosts = new Map()
  }

  public static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService()
    }
    return ConnectionService.instance
  }

  broadcastToHost(message: BroadcastMessage, hostSocket: HostWebSocket) {
    const jsonMessage = JSON.stringify(message)
    if (hostSocket.readyState == WebSocket.OPEN) {
      hostSocket.send(jsonMessage)
    }
  }
  broadcastToPlayers(
    playerWebSockets: PlayerWebSocket[],
    broadcastMessage: BroadcastMessage,
  ) {
    const jsonMessage:string = JSON.stringify(broadcastMessage)
    for (const playerSocket of playerWebSockets) {
      this.broadcastToPlayer(jsonMessage, playerSocket)
    }
  }
  broadcastToPlayer(jsonMessage: string, playerSocket: PlayerWebSocket) {
    if (playerSocket.readyState == WebSocket.OPEN) {
      playerSocket.send(jsonMessage)
    }
  }

  broadcastToRoom(message: BroadcastMessage, room: Room) {
    const jsonMessage = JSON.stringify(message)
    const clients = this.connectedPlayers.get(room.roomcode)
    const host = this.connectedHosts.get(room.roomcode)

    if (!host) {
      throw new ReferenceError(`Host for room ${room.roomcode} not found`)
    }

    if (host.readyState === WebSocket.OPEN) {
      host.send(jsonMessage)
    }

    // Check if there are any clients for the room
    if (!clients) {
      throw new ReferenceError(`No clients found for room ${room.roomcode}`)
    }

    // Iterate over the WebSocket objects in the map
    for (const client of clients.values()) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(jsonMessage)
      }
    }
  }

  private logPlayers(roomcode: string) {
    const sockets = this.connectedPlayers.get(roomcode)
    if (!sockets) {
      return
    }
    console.log(`All players in room ${roomcode}`)
    for (const socket of sockets.values()) {
      console.log(` - ${socket.player.name}`)
    }
  }

  // send updated users list to all connected clients
  broadcastGameInformation(room: Room) {
    const message: BroadcastMessage = {
      event: "update-users",
      room: room,
    }
    this.broadcastToRoom(message, room)
  }

  addRoomConnection(roomcode: string) {
    this.connectedPlayers.set(roomcode, new Map())
  }

  getPlayerSocketsFromNameArray(
    playerNames: string[],
    roomcode: string,
  ): PlayerWebSocket[] {
    if (!playerNames || !Array.isArray(playerNames)) {
      throw new TypeError("playerNames must be a valid array")
    }

    const room = this.connectedPlayers.get(roomcode)

    if (!room) {
      throw new ReferenceError(`Room with code ${roomcode} does not exist.`)
    }

    return playerNames.map((name) => {
      const playerSocket = room.get(name)

      if (!playerSocket) {
        throw new ReferenceError(
          `Player with name ${name} does not exist in room ${roomcode}.`,
        )
      }

      return playerSocket
    })
  }

  connectPlayer(player: Player, playerSocket: PlayerWebSocket) {
    playerSocket.player = player
    const roomMap: Map<string, PlayerWebSocket> | undefined = this
      .connectedPlayers.get(player.connectedGameCode)
    if (!roomMap) {
      throw new ReferenceError(
        "The room you are trying to connect to does not exist",
      )
    }
    roomMap.set(player.name, playerSocket)
  }

  disconnectPlayer(playerSocket: PlayerWebSocket) {
    console.log("Socket closed!")
    const player: Player = playerSocket.player
    this.connectedPlayers.get(player.connectedGameCode)?.delete(player.name)
  }

  connectHost(host: Host, hostSocket: HostWebSocket) {
    hostSocket.host = host
    this.connectedHosts.set(host.hostedGameCode, hostSocket)
  }

  disconnectHost(hostSocket: HostWebSocket) {
    this.connectedHosts.delete(hostSocket.host.hostedGameCode)
  }
}
