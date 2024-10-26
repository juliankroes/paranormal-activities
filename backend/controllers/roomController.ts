import { Player } from "../models/player.model.ts"
import { Room } from "../models/room.model.ts"
import RoomService from "../services/roomService.ts"
import ConnectionService from "../services/connectionService.ts"
import { CreateRoomMessage, JoinRoomMessage, LeaveRoomMessage } from "../types/messages.ts"
import { PlayerWebSocket } from "../types/userWebSocket.ts"
import BroadcastMessage from "../types/broadcastMessage.ts"
import { HostWebSocket } from "../types/hostWebSocket.ts"
import { Host } from "../models/host.model.ts"

// TODO: export redundant roomcontroller code to a service
export default class RoomController {
  private roomService: RoomService
  private connectionService: ConnectionService

  constructor() {
    this.roomService = RoomService.getInstance()
    this.connectionService = ConnectionService.getInstance()
  }

  createRoom(message: CreateRoomMessage, hostSocket: HostWebSocket) {
    try {
      const uniqueRoomCode = this.roomService.generateUniqueRoomCode()
      const host: Host = new Host(uniqueRoomCode, null, message.deviceId)
      const room: Room = this.roomService.createRoom(hostSocket, uniqueRoomCode)

      this.connectionService.connectHost(host, hostSocket)
      this.connectionService.addRoomConnection(room.roomcode)
      this.connectionService.broadcastGameInformation(room)
    } catch (error: unknown) {
      this.broadcastErrorToHost("An unknown error occured", hostSocket)
      console.error(error)
    }
  }

  deleteRoom(Host: Host) {
    this.connectionService.addRoomConnection
  }

  joinRoom(joinRoomMessage: JoinRoomMessage, socket: PlayerWebSocket) {
    try {
      const room: Room = this.roomService.getRoomByCode(joinRoomMessage.roomcode)
      const player: Player = new Player(
        joinRoomMessage.name,
        room.roomcode,
        joinRoomMessage.deviceId,
        false,
      )

      this.roomService.addPlayerToRoom(player, room)
      this.connectionService.connectPlayer(player, socket)
      this.connectionService.broadcastGameInformation(room)
    } catch (error: unknown) {
      if (error instanceof ReferenceError) {
        this.broadcastErrorToPlayer(error.message, socket)
      } else {
        this.broadcastErrorToPlayer("An unknown error occured", socket)
        console.error(error)
      }
    }
  }

  leaveRoom(socket: PlayerWebSocket) {
    this.roomService.removePlayerFromRoom(socket.player)
    const room: Room = this.roomService.getRoomByCode(
      socket.player.connectedGameCode,
    )
    this.connectionService.broadcastGameInformation(room)
  }

  private broadcastErrorToPlayer(details: string, socket: PlayerWebSocket) {
    const message: BroadcastMessage = {
      event: "error-message",
      isError: true,
      details: details,
    }
    const jsonMessage: string = JSON.stringify(message)
    this.connectionService.broadcastToPlayer(jsonMessage, socket)
  }
  private broadcastErrorToHost(details: string, socket: HostWebSocket) {
    const message: BroadcastMessage = {
      event: "error-message",
      isError: true,
      details: details,
    }
    this.connectionService.broadcastToHost(message, socket)
  }
}
