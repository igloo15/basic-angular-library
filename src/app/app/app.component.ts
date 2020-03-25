import { Component } from '@angular/core';
import { Hotkeys, DiceDialogComponent, GameService, GameServerService } from 'baseturnlib';
import { MatDialog } from '@angular/material/dialog';
import { DiceGameService } from './services/dice-game.service';
import { StatusType } from './models/updates';
import { EventService } from './services/event.service';
import { PlayerService } from './services/player.service';
import { BoardService } from './services/board.service';

@Component({
  selector: 'dg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'baseturn-game';


  constructor(private hotkeyService: Hotkeys, private dialog: MatDialog, public diceGameService: DiceGameService,
              public boardService: BoardService, public playerService: PlayerService, public eventService: EventService) {

  }

  openDiceRoller() {
    this.diceGameService.roll();
  }

  nextTurn() {
    this.eventService.stateEmit({
      playerId: this.playerService.currentPlayerId,
      status: StatusType.ConfirmStartTurn
    });
    // this.gameService.openConnectionWindow('ws://broker.hivemq.com:8000/mqtt', 'myGame');
  }

  get allowNextTurn() {
    return this.diceGameService.currentState === StatusType.MoveEnd;
  }

  get allowRolling() {
    return this.diceGameService.currentState === StatusType.Rolling;
  }
}
