// inputResolverService.ts
import { Player } from "../models/player.model.ts"
import { CollaborativeOutput } from "../types/collaborativeOutput.ts"
import GameService from "./gameService.ts"

export default class InputResolverService {
  private inputResolvers: { [playerName: string]: (input: string) => void } = {}
  private collaborativeResolvers: { [playerName: string]: (answer: string) => void } = {}
  private voteResolvers: { [playerName: string]: (input: string) => void } = {}

  private gameService: GameService;

  constructor() {
    this.gameService = new GameService()
  }

  handlePlayerInput(playerName: string, input: string) {
    if (this.inputResolvers[playerName]) {
      this.inputResolvers[playerName](input)
      delete this.inputResolvers[playerName]
    }
  }

  waitForPlayerInput(playerName: string): Promise<string> {
    return new Promise((resolve) => {
      this.inputResolvers[playerName] = resolve
    })
  }

  handleCollaborativeAnswer(name: string, answer: string) {
    if (this.collaborativeResolvers[name]) {
      this.collaborativeResolvers[name](answer)
      delete this.collaborativeResolvers[name]
    }
  }

  // TODO: should also send the update to unsubmitted players
  async waitForCollaborativeInput(
    spirits: Player[],
    prompt: string,
    durationSeconds: number
  ): Promise<CollaborativeOutput> {
    const collaborativeOutput: CollaborativeOutput = { prompt, fullOutput: [] }
  
    this.gameService.collaborativeInputMessage(
        collaborativeOutput,
        'Add to what your fellow spirits came up with',
        spirits[0].connectedGameCode,
        spirits
    )
    

    const responsePromises = spirits.map(spirit =>
      new Promise<void>(resolve => {
        this.collaborativeResolvers[spirit.name] = (answer) => {
          // Add each player's answer to the fullOutput
          collaborativeOutput.fullOutput.push({ player: spirit, output: answer })
  
          // Send the updated output to all players
          this.gameService.collaborativeInputMessage(
            collaborativeOutput,
            'Add to what your fellow spirits came up with',
            spirit.connectedGameCode,
            spirits
          )
  
          resolve()
        }
      })
    )
  
    await Promise.race([
      Promise.all(responsePromises),
      this.startTimer(durationSeconds)
    ])
  
    return collaborativeOutput
  }
  handleVoteAnswer(playerName: string) {
    if (this.voteResolvers[playerName]) {
      this.voteResolvers[playerName](playerName)
      delete this.voteResolvers[playerName]
    }
  }
  waitForVotes(players: Player[]): Promise<string> {
    const voteCounts: { [playerName: string]: number } = {}
  
    return Promise.all(
      players.map(player =>
        new Promise<void>(resolve => {
          this.voteResolvers[player.name] = () => {
            voteCounts[player.name] = (voteCounts[player.name] || 0) + 1
            resolve()
          }
        })
      )
    ).then(() => {
      let maxVotes = 0
      let winner = ""
  
      for (const playerName in voteCounts) {
        if (voteCounts[playerName] > maxVotes) {
          maxVotes = voteCounts[playerName]
          winner = playerName
        }
      }
      
      return winner
    })
  }

  private startTimer(durationSeconds: number): Promise<"timeout"> {
    return new Promise((resolve) => {
      setTimeout(() => resolve("timeout"), durationSeconds * 1000)
    })
  }
  
}

