import { Host } from "../models/host.model.ts"
import { Player } from "../models/player.model.ts"
import { Room } from "../models/room.model.ts"
import { CollaborativeOutput, CollaborativeOutputUtils } from "../types/collaborativeOutput.ts"
import { HostWebSocket } from "../types/hostWebSocket.ts"
import { CollaborativeAnswerMessage } from "../types/messages.ts"
import ConnectionService from "./connectionService.ts"
import FormattingService from "./formattingService.ts"
import GameService from "./gameService.ts"
import InputResolverService from "./inputResolverService.ts"
import PromptService from "./promptService.ts"
import RoomService from "./roomService.ts"

export default class GameLoop {

  // services
  private gameService: GameService
  private connectionService: ConnectionService
  private roomService: RoomService
  private promptService: PromptService
  private formattingService: FormattingService
  private inputResolverService: InputResolverService 


  // globals
  private room: Room
  private hostWebSocket: HostWebSocket

  constructor(roomcode: string) {
    this.gameService = new GameService()
    this.roomService = RoomService.getInstance()
    this.promptService = new PromptService()
    this.connectionService = ConnectionService.getInstance()
    this.formattingService = new FormattingService()
    this.inputResolverService = new InputResolverService()

    this.room = this.roomService.getRoomByCode(roomcode)
    this.hostWebSocket = this.connectionService.connectedHosts.get(roomcode)!
  }


  public async main() {
    this.room.allowQuit = false

    const players: Player[] = [...this.room.playerList.values()]
    await this.explanation(10, players)

    const medium: Player = await this.voteMedium(30, players)
    await this.quickDisplay(`${medium.name} has been voted to be the medium`, 10)
    const spirits: Player[] = players.filter((player) => player !== medium)
    const randomPrompt: string = await this.promptService.getRandomPrompt()

    const question: string = await this.mediumAnswerPrompt(45, medium, spirits, randomPrompt)
    const answers: string[] = await this.spiritsAnswerPrompt(60, spirits, question)
    const combinedAnswers: string = answers.join(' ')
    await this.quickDisplay(question, 10)
    await this.quickDisplay(combinedAnswers, 10)
    await this.quickDisplay("What could the meaning of this strange message be?", 10)

    const interpertation: string = await this.question(45, medium, `What is the meaning of "${combinedAnswers}"`)
    await this.quickDisplay(interpertation, 10)
    await this.quickDisplay("thank you all for playing!", 10)
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

    const result = await Promise.race([
      this.startTimer(durationSeconds),
      this.waitForVotes(players)
    ])
    console.log(result)

    const playerEntry = this.room.playerList.entries().next()
    if (!playerEntry.done) {
      const [, player] = playerEntry.value
      if (player instanceof Player) {
        return player
      }
    }
    throw new Error("No player found")
  }

  // TODO: prompt should be an argument
  private async mediumAnswerPrompt(durationSeconds: number, medium: Player, spirits: Player[], mediumPrompt: string): Promise<string> {
    this.gameService.display(
      `${medium.name}, fill in the blank of the question on your device`,
      this.formattingService.secondsToEndTime(durationSeconds),
      this.hostWebSocket,
    )
    const prompt: string = mediumPrompt
    const placeholder: string = "fill in the blank"

    this.gameService.informativeMessage(
      `Waiting for ${medium.name} to answer the prompt on their device`,
      this.room.roomcode,
      this.formattingService.playerListToStringList(spirits)
    )
    this.gameService.inputMessage(
      prompt,
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
          prompt,
            result,
            this.hostWebSocket,
        )
        const modifiedPrompt: string = prompt.replace('____', result)
        return modifiedPrompt
    }
    return prompt
    
  }
  private async question(durationSeconds: number, targetPlayer: Player, prompt: string): Promise<string> {
    this.gameService.display(
      `${targetPlayer.name}, fill in the blank of the question on your device`,
      this.formattingService.secondsToEndTime(durationSeconds),
      this.hostWebSocket,
    )
    const placeholder: string = "fill in the blank"

    this.gameService.inputMessage(
      prompt,
      placeholder,
      this.room.roomcode,
      [targetPlayer.name],
    )

    const result = await Promise.race([
      this.waitForPlayerInput(targetPlayer),
      this.startTimer(durationSeconds),
    ])

    if (result === "timeout") {
        // TODO: retrieve input if not in time
        console.log("player did not answer in time")
        this.gameService.clear(this.room.roomcode, [targetPlayer.name])
    } else { 
        console.log(result)
        return result
    }
    return "No answer"
    
  }
  private async spiritsAnswerPrompt(
    durationSeconds: number,
    spirits: Player[],
    prompt: string
  ): Promise<string[]> {
    this.gameService.display(
      "Spirits answer the prompt on your device together",
      this.formattingService.secondsToEndTime(durationSeconds),
      this.hostWebSocket,
    )
    
    const output: CollaborativeOutput = {prompt: prompt, fullOutput:[]}
    this.gameService.collaborativeInputMessage(output, 'do your part', this.room.roomcode, spirits)
  
    // Wait for the responses or until the timer ends
    const fullOutput = await this.waitForCollaborativeInput(spirits, prompt, durationSeconds)
  
    return fullOutput.fullOutput.map(entry => entry.output)
  }
  private async quickDisplay(message: string, durationSeconds: number) {
    this.gameService.display(
      message,
      false,
      this.hostWebSocket,
    )
    await this.startTimer(durationSeconds)
  }
  
  private startTimer(durationSeconds: number): Promise<"timeout"> {
    return new Promise((resolve) => {
      setTimeout(() => resolve("timeout"), durationSeconds * 1000)
    })
  }

  waitForPlayerInput(medium: Player): Promise<string> {
    return this.inputResolverService.waitForPlayerInput(medium.name)
  }

  handlePlayerInput(playerName: string, input: string) {
    this.inputResolverService.handlePlayerInput(playerName, input)
  }

  waitForCollaborativeInput(spirits: Player[], prompt: string, durationSeconds: number): Promise<CollaborativeOutput> {
    return this.inputResolverService.waitForCollaborativeInput(spirits, prompt, durationSeconds)
  }

  handleCollaborativeAnswer(name: string, answer: string) {
    this.inputResolverService.handleCollaborativeAnswer(name, answer)
  }

  waitForVotes(players: Player[]): Promise<string> {
    const winningPlayerName: Promise<string> = this.inputResolverService.waitForVotes(players)
    return winningPlayerName
  }

  handleVoteAnswer(playerName: string) {
    console.log(`+ one vote for ${playerName}`)
    this.inputResolverService.handleVoteAnswer(playerName)
  }
}
