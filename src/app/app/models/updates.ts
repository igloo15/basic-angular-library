import { Guid } from 'guid-typescript';

export interface IGameUpdate {
    playerId: Guid;
}

export class RollUpdate implements IGameUpdate {
    playerId: Guid;
    newValue: number;
    oldValue: number;
}

export class MovementUpdate implements IGameUpdate {
    playerId: Guid;
    columnName: string;
    index: number;
    pieceIndex: number;
}

export enum StatusType {
    Setup,
    Ready,
    ConfirmStartTurn,
    Rolling,
    Moving,
    MoveEnd
}

export class StatusUpdate implements IGameUpdate {
    playerId: Guid;
    status: StatusType;
}

export class PlayerUpdate implements IGameUpdate {
    playerId: Guid;
    name: string;
    color: string;
    startNum?: number;
}
