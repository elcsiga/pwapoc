import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private timer;
  online: string;

  constructor() {
  }

  updateOnlineFlag() {
    this.online = navigator && navigator.onLine === true ? 'online'
      : navigator && navigator.onLine === false ? 'offline' : '???';
  }

  ngOnInit() {
    this.updateOnlineFlag();
    this.timer = setInterval(() => this.updateOnlineFlag(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

}
