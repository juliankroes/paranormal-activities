import Player from "../models/Player.model"

type CollaborativeOutput = {
  prompt: string
  fullOutput: {
    player: Player
    output: string
  }[]
}

export type {CollaborativeOutput}