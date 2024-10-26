export default class Player {
  name: string
  connectedGameCode: string
  deviceId: string
  isPartyLeader: boolean

  constructor(
    name: string,
    connectedGameCode: string,
    deviceId: string,
    isPartyLeader: boolean,
  ) {
    this.name = name
    this.connectedGameCode = connectedGameCode
    this.deviceId = deviceId
    this.isPartyLeader = isPartyLeader
  }
}
