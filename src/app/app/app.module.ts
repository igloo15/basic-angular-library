import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './modules/angular-material.module';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { BaseTurnLibModule } from 'baseturnlib';
import { AppComponent } from './app.component';
import { GameTableComponent } from './components/game-table/game-table.component';
import { PlayerTableComponent } from './components/player-table/player-table.component';
import { BoardSpotComponent } from './components/board-spot/board-spot.component';
import { GamePieceComponent } from './components/game-piece/game-piece.component';

@NgModule({
  declarations: [
    AppComponent,
    GameTableComponent,
    PlayerTableComponent,
    BoardSpotComponent,
    GamePieceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    LoggerModule.forRoot({level: NgxLoggerLevel.DEBUG}),
    BaseTurnLibModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: []
})
export class AppModule { }
