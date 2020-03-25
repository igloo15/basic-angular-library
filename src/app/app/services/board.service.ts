import { Injectable } from '@angular/core';
import { IBoardSpotData } from '../components/board-spot/board-spot.component';
import { PlayerService } from './player.service';
import { Piece } from '../models/piece';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  public boardSpots: IBoardSpotData[] = [];

  constructor(public playerService: PlayerService) { }

  retrieveSpot(columnName: string, index: number): IBoardSpotData {
    for (const spot of this.boardSpots) {
      if (spot.columnName === columnName && spot.index === index) {
        return spot;
      }
    }
    return null;
  }

  registerBoardPiece(boardData: IBoardSpotData) {
    this.boardSpots.push(boardData);
  }

  findNextSpot(current: Piece, movement: number): IBoardSpotData {
    if (!current.columnName) {
      const spot = this.retrieveSpot(this.playerService.currentPlayerColumn, movement);
      if (spot && spot.piece) {
        return null;
      }
      return spot;
    } else {
      const currentSpot = this.retrieveSpot(current.columnName, current.index);
      return this.findNextSpotWithStart(currentSpot, movement);
    }
  }

  findNextSpotWithStart(currentSpot: IBoardSpotData, movement: number): IBoardSpotData {
    const nextMovement = currentSpot.index + movement;
    const column = this.playerService.currentPlayerColumn;
    const completeCol = this.playerService.currentPlayerCompleteColumn;
    let nextSpot: IBoardSpotData = null;
    if (currentSpot.columnName === column && currentSpot.index < 5) {
      if (nextMovement > 4) {
        const middleMove = nextMovement - 4;
        nextSpot = this.retrieveSpot('middle', middleMove);
      } else {
        nextSpot = this.retrieveSpot(column, nextMovement);
      }
    } else if (currentSpot.columnName === 'middle') {
      if (nextMovement > 8) {
        const playerMove = nextMovement - 8;
        if (playerMove > 4) {
          nextSpot = null;
        } else if (playerMove === 3) {
          nextSpot = this.retrieveSpot(completeCol, 0);
        } else {
          nextSpot = this.retrieveSpot(column, playerMove + 4);
        }
      } else {
        nextSpot = this.retrieveSpot('middle', nextMovement);
      }
    } else if (currentSpot.columnName === column) {
      if ((currentSpot.index === 6 && movement === 1) ||
          (currentSpot.index === 5 && movement === 2)) {
        nextSpot = this.retrieveSpot(completeCol, 0);
      } else if (currentSpot.index === 5 && movement === 1) {
        nextSpot = this.retrieveSpot(column, 6);
      }
    }

    if (nextSpot && nextSpot.piece) {
      if (nextSpot.piece.player === this.playerService.currentPlayer) {
        nextSpot = null;
      } else if (nextSpot.isSpecial) {
        nextSpot = null;
      }
    }

    return nextSpot;
  }

  get isMoveAvailable(): boolean {
    const playerRoll = this.playerService.currentPlayerRoll;
    for (const piece of this.playerService.currentPlayerPieces) {
      const nextSpot = this.findNextSpot(piece, playerRoll);
      if (nextSpot) {
        return true;
      }
    }
    return false;
  }

  clearSpotActive() {
    this.boardSpots.forEach(spot => {
      spot.active = false;
    });
  }
}
