import { Injectable, EventEmitter } from '@angular/core';
import { StatusUpdate, RollUpdate, MovementUpdate, PlayerUpdate } from '../models/updates';
import { TypedEvent, Listener, IDisposable } from 'baseturnlib';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private rollUpdate: TypedEvent<RollUpdate> = new TypedEvent<RollUpdate>();
  private movementUpdate: TypedEvent<MovementUpdate> = new TypedEvent<MovementUpdate>();
  private stateUpdate: TypedEvent<StatusUpdate> = new TypedEvent<StatusUpdate>();
  private playerUpdate: TypedEvent<PlayerUpdate> = new TypedEvent<PlayerUpdate>();


  constructor() {  }

  onRollUpdate(listener: Listener<RollUpdate>): IDisposable {
    return this.rollUpdate.on(listener);
  }

  rollEmit(roll: RollUpdate) {
    this.rollUpdate.emit(roll);
  }

  onMovementUpdate(listener: Listener<MovementUpdate>): IDisposable {
    return this.movementUpdate.on(listener);
  }

  movementEmit(move: MovementUpdate) {
    return this.movementUpdate.emit(move);
  }

  onStateUpdate(listener: Listener<StatusUpdate>): IDisposable {
    return this.stateUpdate.on(listener);
  }

  stateEmit(state: StatusUpdate) {
    this.stateUpdate.emit(state);
  }

  onPlayerUpdate(listener: Listener<PlayerUpdate>): IDisposable {
    return this.playerUpdate.on(listener);
  }

  playerEmit(player: PlayerUpdate) {
    this.playerUpdate.emit(player);
  }
}
