import { Injectable } from '@angular/core';
import { Player, OnlinePlayer, TurnLoop, GameService } from 'baseturnlib';
import { Guid } from 'guid-typescript';
import { Piece } from '../models/piece';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  leftPlayer: Player;
  rightPlayer: Player;
  public looper: TurnLoop = new TurnLoop();

  constructor(public gameService: GameService) { }

  addPlayer(name: string, color: string, left: boolean, id?: Guid) {
    const newPlayer = this.createPlayer(name, color, id);
    this.looper.addPlayer(newPlayer);
    if (left) {
      this.leftPlayer = newPlayer;
    } else {
      this.rightPlayer = newPlayer;
    }
  }

  createPlayer(name: string, color: string, id?: Guid): Player {
    const player = id ? new OnlinePlayer(id, name) : new Player(name);
    player.playerProps.waitingPieces = [];
    player.playerProps.boardPieces = [];
    player.playerProps.completedPieces = [];
    for (let index = 0; index < 7; index++) {
      this.addWaitingPiece(player, index);
    }
    player.playerProps.color = color;
    return player;
  }

  find(id: Guid): Player {
    return this.looper.players.find(p => p.id === id);
  }

  addWaitingPiece(player: Player, id: number) {
    player.playerProps.waitingPieces.push(new Piece(player, id));
  }

  get currentPlayer(): Player {
    return this.looper.currentPlayer;
  }

  get otherPlayer(): Player {
    return this.looper.getNextPlayer();
  }

  get currentPlayerColumn(): string {
    return `player-${this.currentPlayer.index}`;
  }

  get currentPlayerCompleteColumn(): string {
    return `complete-${this.currentPlayer.index}`;
  }

  get currentPlayerId(): Guid {
    return this.currentPlayer.id;
  }

  get currentPlayerRoll(): number {
    return this.currentPlayer.playerProps.playerRoll;
  }

  get currentPlayerPieces(): Piece[] {
    return this.currentPlayer.playerProps.waitingPieces.concat(this.currentPlayer.playerProps.boardPieces);
  }

  get isMyTurn() {
    return this.currentPlayer.id === this.leftPlayer.id || !this.gameService.connectedOnline;
  }
}
