import { Component } from '@angular/core';
import { environment } from '../environments/environment';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'broad-covid-dashboard';
    config:zingchart.graphset = {
      type: 'line',
      series: [
        { values: [3,49,12,23,30, 44] }
      ]
    };

    scalingChartWidth = Math.floor(Math.max(window.innerWidth, 1430) * 0.66);
    env: any;

    constructor() {
      this.env = environment;
    }
}
