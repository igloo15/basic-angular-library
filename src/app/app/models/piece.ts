import { Player } from 'baseturnlib';

export class Piece {
    id: number;
    columnName: string;
    index: number;
    color: string;
    active: boolean;
    player: Player;

    constructor(player: Player, id: number) {
        this.player = player;
        this.id = id;
    }
}
