import { Injectable, EventEmitter } from '@angular/core';
import { TurnLoop, Player, GameUtil, GameService, OnlinePlayer } from 'baseturnlib';
import { Piece } from '../models/piece';
import { IBoardSpotData } from '../components/board-spot/board-spot.component';
import { EventService } from './event.service';
import { StatusType, RollUpdate, StatusUpdate } from '../models/updates';
import { PlayerService } from './player.service';
import { BoardService } from './board.service';

@Injectable({
  providedIn: 'root'
})
export class DiceGameService {

  private tempLeftPlayer: Player;

  public piecePicking = false;
  public currentState: StatusType = StatusType.Setup;
  public setupTimer: NodeJS.Timer;
  public isOnline: boolean;

  constructor(public gameService: GameService, public events: EventService, public playerService: PlayerService,
              public boardService: BoardService) {
    this.randomCheck();

    this.setupGame();
    this.events.onStateUpdate(state => {
      this.currentState = state.status;
      switch (state.status) {
        case StatusType.Setup:
          break;
        case StatusType.Ready:
          if (state.playerId !== this.tempLeftPlayer.id) {
            clearInterval(this.setupTimer);
          }
          break;
        case StatusType.ConfirmStartTurn:
          const confirmAction = this.playerService.looper.endTurn();
          const playerTwoStart = confirmAction();
          if (!(this.isOnline && this.playerService.otherPlayer.id !== this.playerService.leftPlayer.id)) {
            this.gameService.openConfirmationWindow(`Player ${this.playerService.otherPlayer.name} are you ready?`, 'Yes', 'No')
            .then(startResult => {
                if (startResult) {
                  playerTwoStart();
                  this.events.stateEmit({
                    playerId: this.playerService.currentPlayerId,
                    status: StatusType.Rolling
                  });
                }
              }
            );
          } else {
            playerTwoStart();
          }
          break;
        case StatusType.Rolling:
          break;
        case StatusType.Moving:
          break;
        case StatusType.MoveEnd:
          break;
      }
    });
    this.events.onRollUpdate(rollState => {
      this.internalRoll(rollState.newValue, rollState.oldValue);
      if (this.playerService.isMyTurn) {
        this.events.stateEmit({
          playerId: this.playerService.currentPlayerId,
          status: StatusType.Moving
        });
      }
    });
    this.events.onMovementUpdate(movement => {
      const spot = this.boardService.retrieveSpot(movement.columnName, movement.index);
      const piece = this.playerService.currentPlayerPieces.filter(x => x.index === movement.pieceIndex)[0];
      this.movePiece(spot, piece);
    });
    this.events.onPlayerUpdate(player => {
      if (this.isOnline) {
        const foundPlayer = this.playerService.find(player.playerId);
        if (this.currentState === StatusType.Setup) {
          if (!foundPlayer && this.tempLeftPlayer && this.tempLeftPlayer.id !== player.playerId) {
            this.events.stateEmit({
              playerId: this.tempLeftPlayer.id,
              status: StatusType.Ready
            });
            if (player.startNum > this.tempLeftPlayer.playerProps.startTime) {
              this.playerService.looper.addPlayer(this.tempLeftPlayer);
              this.playerService.leftPlayer = this.tempLeftPlayer;
              this.playerService.addPlayer(player.name, player.color, false, player.playerId);
            } else {
              this.playerService.looper.addPlayer(this.tempLeftPlayer);
              this.playerService.leftPlayer = this.tempLeftPlayer;
              this.playerService.addPlayer(player.name, player.color, false, player.playerId);
            }
            this.startGame();
          }
        } else {
          // Do non setup stuff
        }
      }
    });
  }

  private async setupGame() {
    const tempPlayer = this.playerService.createPlayer('MyTempName', 'blue');
    const player = await this.gameService.openPlayerWindow(tempPlayer);
    this.isOnline = await this.gameService.openConfirmationWindow('Play a Local or Online Game?', 'Online', 'Local', 'Game Type');
    if (this.isOnline) {
      this.gameService.connectedOnline = true;
      this.isOnline = true;
      this.tempLeftPlayer = this.playerService.createPlayer('MyName', 'blue');
      this.gameService.openConnectionWindow('ws://broker.hivemq.com:8000/mqtt', 'testid', this.tempLeftPlayer);
      const currentTime = new Date().getTime();
      this.tempLeftPlayer.playerProps.startTime = currentTime;
      this.setupTimer = setInterval(() => {
        this.events.playerEmit({
          playerId: this.tempLeftPlayer.id,
          name: this.tempLeftPlayer.name,
          color: this.tempLeftPlayer.playerProps.color,
          startNum: currentTime
        });
      }, 1500);
    } else {
      this.playerService.addPlayer('One', 'blue', true);
      this.playerService.addPlayer('Two', 'red', false);
    }
  }

  private startGame() {
    this.playerService.looper.takeTurn();
  }

  private randomCheck() {
    const myCounts = [0, 0, 0, 0, 0];
    for (let i = 0; i < 5000; i++) {
      const value = GameUtil.rollDice(4, 1, 0)[0];
      myCounts[value]++;
    }
    console.log('THIS IS A RANDOM CHECK');
    console.log('==========================');
    for (let j = 0; j < myCounts.length; j++) {
      console.log(`Roll ${j}: ${myCounts[j]}`);
    }
    console.log('=========COMPLETE=========');
  }

  roll() {
    this.piecePicking = true;
    const pastValue = this.playerService.currentPlayerRoll;
    const rollValue = GameUtil.rollDice(4, 1, 0)[0];
    this.events.rollEmit({
      playerId: this.playerService.currentPlayerId,
      newValue: rollValue,
      oldValue: pastValue
    });
  }

  internalRoll(newValue: number, oldValue: number) {
    this.playerService.currentPlayer.playerProps.playerRoll = -1;
    this.boardService.clearSpotActive();
    setTimeout(() => {
      console.log(`New Roll: Current Value: ${oldValue} / New Value: ${newValue}`);
      this.playerService.currentPlayer.playerProps.playerRoll = newValue;
      if (this.playerService.isMyTurn && (newValue === 0 || !this.boardService.isMoveAvailable)) {
        this.events.stateEmit({
          playerId: this.playerService.currentPlayerId,
          status: StatusType.MoveEnd
        });
      }
    }, 100);
  }

  togglePiece(piece: Piece) {
    this.boardService.clearSpotActive();
    if (piece.active) {
      const roll: number = this.playerService.currentPlayerRoll;
      let spot: IBoardSpotData = null;
      if (roll > 0) {
        spot = this.boardService.findNextSpot(piece, roll);
        if (spot) {
          spot.active = true;
          if (spot.columnName === 'complete') {
            console.log('move home');
          }
        }
      } else {
        this.gameService.openMessage('roll higher next time');
      }
    }
  }

  spotClicked(spot: IBoardSpotData) {
    const currentPiece = this.activePiece;
    if (spot.active && currentPiece) {
      this.gameService.openConfirmationWindow('Are you sure you want to move?', 'Yes', 'No', 'Piece Movement').then(result => {
        if (result) {
          this.events.movementEmit({
            playerId: this.playerService.currentPlayerId,
            columnName: spot.columnName,
            index: spot.index,
            pieceIndex: currentPiece.index
          });
        }
      });
    }
  }

  movePiece(spot: IBoardSpotData, currentPiece: Piece) {
    if (!currentPiece.columnName) {
      const arrayLoop: Piece[] = this.playerService.currentPlayer.playerProps.waitingPieces;
      GameUtil.removeFromArray(arrayLoop, currentPiece);
      this.playerService.currentPlayer.playerProps.boardPieces.push(currentPiece);
    } else {
      const pastSpot = this.boardService.retrieveSpot(currentPiece.columnName, currentPiece.index);
      if (pastSpot) {
        pastSpot.piece = null;
      }
    }

    if (spot.piece) {
      const otherPlayerPiece = spot.piece;
      this.removePieceFromBoard(otherPlayerPiece);
      otherPlayerPiece.player.playerProps.waitingPieces.push(otherPlayerPiece);
    }

    if (spot.columnName === this.playerService.currentPlayerCompleteColumn) {
      this.removePieceFromBoard(currentPiece);
      this.playerService.currentPlayer.playerProps.completedPieces.push(currentPiece);
    } else {
      currentPiece.active = false;
      currentPiece.columnName = spot.columnName;
      currentPiece.index = spot.index;
      spot.piece = currentPiece;
      spot.active = false;
    }

    if (spot.isSpecial) {
      this.gameService.openMessage('Big Winner Rolling Again!!!!');
      if (this.playerService.isMyTurn) {
        this.roll();
      }
      this.piecePicking = true;
    } else {
      this.piecePicking = false;
    }

    if (!this.piecePicking && this.playerService.isMyTurn) {
      this.events.stateEmit({
        playerId: this.playerService.currentPlayerId,
        status: StatusType.MoveEnd
      });
    }
  }

  get activePiece(): Piece {
    for (const piece of this.playerService.currentPlayer.playerProps.waitingPieces) {
      if (piece.active) {
        return piece;
      }
    }
    for (const piece of this.playerService.currentPlayer.playerProps.boardPieces) {
      if (piece.active) {
        return piece;
      }
    }
    return null;
  }

  removePieceFromBoard(piece: Piece) {
    const otherPlayer = piece.player;
    GameUtil.removeFromArray(otherPlayer.playerProps.boardPieces, piece);
    piece.columnName = null;
    piece.index = 0;
    piece.active = false;
  }
}
