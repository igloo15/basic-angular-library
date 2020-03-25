import { Component, OnInit } from '@angular/core';
import { IBoardSpotData } from '../board-spot/board-spot.component';
import { DiceGameService } from '../../services/dice-game.service';

@Component({
  selector: 'dg-game-table',
  templateUrl: './game-table.component.html',
  styleUrls: ['./game-table.component.scss']
})
export class GameTableComponent implements OnInit {

  constructor(private diceGameService: DiceGameService) { }

  ngOnInit() {
  }

  onClicked(data: IBoardSpotData) {
    console.log(data);
    this.diceGameService.spotClicked(data);
  }

}
