import Player from "./Player.model";

export default class Room {
    roomcode: string;
    playerList: Player[];
    deviceId: string;

    constructor(roomcode: string, playerList: Player[], deviceId: string) {
        this.roomcode = roomcode
        this.playerList = playerList
        this.deviceId = deviceId
    }
}
