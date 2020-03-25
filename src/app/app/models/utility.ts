import { Player } from 'baseturnlib';
import { Piece } from './piece';

export class DiceGameUtil {

    public static clearActivePieces(player: Player) {
        player.getProp<Piece[]>('waitingPieces').forEach(piece => piece.active = false);
        player.getProp<Piece[]>('boardPieces').forEach(piece => piece.active = false);
    }
}
