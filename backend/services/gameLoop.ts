import { Host } from "../models/host.model.ts"
import { Player } from "../models/player.model.ts"
import { Room } from "../models/room.model.ts"
import { CollaborativeOutput, CollaborativeOutputUtils } from "../types/collaborativeOutput.ts"
import { HostWebSocket } from "../types/hostWebSocket.ts"
import ConnectionService from "./connectionService.ts"
import FormattingService from "./formattingService.ts"
import GameService from "./gameService.ts"
import PromptService from "./promptService.ts"
import RoomService from "./roomService.ts"

export default class GameLoop {
  // services
  private gameService: GameService
  private connectionService: ConnectionService
  private roomService: RoomService
  private promptService: PromptService
  private formattingService: FormattingService

  // globals
  private room: Room
  private hostWebSocket: HostWebSocket

  constructor(roomcode: string) {
    this.gameService = new GameService()
    this.roomService = RoomService.getInstance()
    this.promptService = new PromptService()
    this.connectionService = ConnectionService.getInstance()
    this.formattingService = new FormattingService()

    this.room = this.roomService.getRoomByCode(roomcode)
    this.hostWebSocket = this.connectionService.connectedHosts.get(roomcode)!
  }


  public async main() {
    const players: Player[] = [...this.room.playerList.values()]
    await this.explanation(7, players)
    const medium: Player = await this.voteMedium(15, players)
    const spirits: Player[] = players.filter((player) => player !== medium) // remove medium from player list
    const question: string = await this.mediumAnswerPrompt(15, medium, spirits)
    await this.spiritsAnswerPrompt(30, spirits, question)
    // displayEncounter(20)
    // mediumInterperatesEncounter(20)
    // displayInterpertation(20)
    // rankResponses
  }

  private async explanation(durationSeconds: number, players: Player[]) {
    this.gameService.display(
      "[explanation here]",
      this.formattingService.secondsToEndTime(durationSeconds),
      this.hostWebSocket,
    )
    this.gameService.informativeMessage(
        "sit tight and watch the explanation", 
        this.room.roomcode, 
        this.formattingService.playerListToStringList(players))
    await this.startTimer(durationSeconds)

  }

  // TODO: end timer when everyone has voted
  private async voteMedium(durationSeconds: number, players: Player[]): Promise<Player> {
    this.gameService.display(
      "vote for who should be the medium",
      this.formattingService.secondsToEndTime(durationSeconds),
      this.hostWebSocket,
    )
    this.gameService.votePlayerMessage(players, this.room.roomcode)
    await this.startTimer(durationSeconds)
    // const votedPlayer = await Promise.race([this.startTimer(durationSeconds)])

    const playerEntry = this.room.playerList.entries().next()
    if (!playerEntry.done) {
      const [, player] = playerEntry.value
      if (player instanceof Player) {
        return player
      }
    }
    throw new Error("No player found")
  }
  private async mediumAnswerPrompt(durationSeconds: number, medium: Player, spirits: Player[]): Promise<string> {
    this.gameService.display(
      `${medium.name}, fill in the blank of the question on your device`,
      this.formattingService.secondsToEndTime(durationSeconds),
      this.hostWebSocket,
    )
    const randomPrompt: string = await this.promptService.getRandomPrompt()
    const placeholder: string = "fill in the blank"

    this.gameService.informativeMessage(
      `Waiting for ${medium.name} to answer the prompt on their device`,
      this.room.roomcode,
      this.formattingService.playerListToStringList(spirits)
    )
    this.gameService.inputMessage(
      randomPrompt,
      placeholder,
      this.room.roomcode,
      [medium.name],
    )

    const result = await Promise.race([
      this.waitForPlayerInput(medium),
      this.startTimer(durationSeconds),
    ])

    if (result === "timeout") {
        // TODO: retrieve input if not in time
        console.log("player did not answer in time")
        this.gameService.clear(this.room.roomcode, [medium.name])
    } else { 
        console.log(result)
        this.gameService.relayAnswerToHost(
            randomPrompt,
            result,
            this.hostWebSocket,
        )
        const modifiedPrompt: string = randomPrompt.replace('____', result)
        return modifiedPrompt
    }
    return randomPrompt
    
  }
  private async spiritsAnswerPrompt(
    durationSeconds: number,
    spirits: Player[],
    prompt: string
  ) {
    this.gameService.display(
      "Spirits answer the prompt on your device together",
      this.formattingService.secondsToEndTime(durationSeconds),
      this.hostWebSocket,
    )
    const output: CollaborativeOutput = CollaborativeOutputUtils.fromPlayers(prompt, spirits)
    this.gameService.collaborativeInputMessage(output,'do your part', this.room.roomcode)
    await this.startTimer(durationSeconds)
  }

  private startTimer(durationSeconds: number): Promise<"timeout"> {
    return new Promise((resolve) => {
      setTimeout(() => resolve("timeout"), durationSeconds * 1000)
    })
  }

  private inputResolvers: { [playerName: string]: (input: string) => void } = {}

  handlePlayerInput(playerName: string, input: string) {
    if (this.inputResolvers[playerName]) {
      this.inputResolvers[playerName](input)
      delete this.inputResolvers[playerName]
    }
  }

  waitForPlayerInput(medium: Player): Promise<string> {
    return new Promise((resolve) => {
      this.inputResolvers[medium.name] = resolve
    })
  }

}
