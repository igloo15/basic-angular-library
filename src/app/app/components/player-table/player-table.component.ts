import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Piece } from '../../models/piece';
import { Player } from 'baseturnlib';

@Component({
  selector: 'dg-player-table',
  templateUrl: './player-table.component.html',
  styleUrls: ['./player-table.component.scss']
})
export class PlayerTableComponent implements OnInit, AfterViewInit {

  public completepieces: Piece[] = [];

  @Input() player: Player;
  @Input() currentRoll: number;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  onWaitPieceClick(piece: Piece) {
    console.log(piece);
  }

}
