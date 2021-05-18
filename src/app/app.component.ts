import { Component } from '@angular/core';
import { environment } from '../environments/environment';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'broad-covid-dashboard';
    env: any;

    // Navbar variables
    navbarLinks = ['dashboard', 'resources', 'about us', 'methods', 'acknowledgments'];

    // Introduction variables
    statesServed = [
      { name: 'Connecticut', glyph: 'G', rotation: 'rotate(-15deg)' },
      { name: 'Maine', glyph: 'U', rotation: 'rotate(-15deg)' },
      { name: 'Massachusetts', glyph: 'S', rotation: 'rotate(-15deg)' },
      { name: 'New York', glyph: 'h', rotation: 'rotate(-30deg)' },
      { name: 'New Hampshire', glyph: 'd', rotation: 'rotate(-15deg)' },
      { name: 'Rhode Island', glyph: 'm', rotation: 'rotate(-15deg)' },
      { name: 'Vermont', glyph: 't', rotation: 'rotate(-15deg)' }
    ];

    // Scaling variables
    config:zingchart.graphset = {
      type: 'line',
      series: [
        { values: [3,49,12,23,30, 44] }
      ]
    };

    scalingChartWidth = Math.floor(Math.min(window.innerWidth, 1430) * 0.66);

    constructor() {
      this.env = environment;
    }
}
