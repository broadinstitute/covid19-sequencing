import { Component } from '@angular/core';
import { environment } from '../environments/environment';

import * as AOS from 'aos';
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

    scalingChart: any;
    variantsChart: any;
    variantsData: any;

    constructor() {
      this.env = environment;
      AOS.init({
        offset: 200,
        duration: 300,
        easing: 'ease-in-sine',
        delay: 0,
        disable: 'mobile',
        once: true
      });

      window.addEventListener('load', AOS.refresh);
    }

    ngOnInit() {
      this.initializeScalingChart();
      this.initializeVariantsChart();
    }

    initializeScalingChart() {
      let scalingChartWidth = Math.floor(Math.min(window.innerWidth, 1430) * 0.58);
      let scalingValues = this.getRandomArray(6);
      let scalingCumulative = [scalingValues[0]];
      scalingValues.forEach((val, i) => {
        if (i !== 0) {
          scalingCumulative[i] = val + scalingCumulative[i-1];
        }
      });

      this.scalingChart = {
        data: [
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: scalingCumulative,
              text: scalingCumulative,
              textposition: 'top',
              type: 'scatter',
              mode: 'lines+markers+text',
              marker: {color: 'orange'},
              name: 'Cumulative',
              hoverinfo: 'skip'
            },
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: scalingValues,
              type: 'bar',
              marker: { color: '#046db6' },
              name: '',
              hovertemplate: `  <b>Week Count:</b>  <br>  %{y}  `
            }
        ],
        layout: {
          width: scalingChartWidth,
          height: scalingChartWidth * .6,
          xaxis: { title: 'Collection Week' },
          yaxis: { title: 'Count of Samples Sequenced' },
          showlegend: false,
          barmode: 'group',
          bargap: .55,
          bargroupgap: 4,
          hovermode: 'closest',
          hoverlabel: {
            bgcolor: '#dcdcdc',
            bordercolor: '#dcdcdc',
            font: {
              color: '#545f6e'
            }
          },
          margin: {
            l: 0, r: 0, t: 0
          }
        }
      };
    }

    initializeVariantsChart() {
      let variantsChartWidth = Math.min(window.innerWidth, 1200) - 260;
      this.variantsData = {
        groups: [
          { title: 'Variants of High Consequence', values: [] },
          {
            title: 'Variants of Concern',
            values: [
              { color: '#eb9f4d', name: 'B.1.1.7', desc: '20I/501Y.V1' },
              { color: '#e84615', name: 'P.1', desc: '2-J/501Y.V3' },
              { color: '#a83f02', name: 'B.1.351', desc: '20H/501.V2' },
              { color: '#f5c173', name: 'B.1.427', desc: '20C/S:452R' },
              { color: '#f26c3e', name: 'B.1.429', desc: '20H/20C/S:452R.V2' }
            ]
          },
          {
            title: 'Variants of Interest',
            values: [
              { color: '#4c6e32', name: 'B.1.526', desc: '20C' },
              { color: '#5bb56b', name: 'B.1.525', desc: '20C' },
              { color: '#256323', name: 'P.2', desc: '20J' }
            ]
          },
          {
            title: 'Other',
            values: [
              { color: '#046db6', name: 'Other Variants' }
            ]
          }
        ]
      };

      this.variantsChart = {
        data: [
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: this.getRandomArray(6),
              type: 'bar',
              marker: { color: '#eb9f4d' },
              name: 'B.1.1.7'
            },
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: this.getRandomArray(6),
              type: 'bar',
              marker: { color: '#e84615' },
              name: 'P.1'
            },
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: this.getRandomArray(6),
              type: 'bar',
              marker: { color: '#a83f02' },
              name: 'B.1.351'
            },
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: this.getRandomArray(6),
              type: 'bar',
              marker: { color: '#f5c173' },
              name: 'B.1.427'
            },
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: this.getRandomArray(6),
              type: 'bar',
              marker: {color: '#f26c3e'},
              name: 'B.1.429'
            },
            {
              x: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'],
              y: this.getRandomArray(6),
              type: 'bar',
              marker: { color: '#046db6' },
              name: 'Other Variants'
            }
        ],
        layout: {
          width: variantsChartWidth,
          height: Math.min(variantsChartWidth * .6, 585),
          xaxis: {
            title: 'Count'
          },
          yaxis: {
            title: 'Count of Samples Sequenced'
          },
          barmode: 'stack',
          bargap: .35,
          bargroupgap: 4,
          showlegend: false,
          margin: {
            l: 50, r: 50, t: 50
          }
        }
      };
    }

    getRandomArray(length: number) {
      let ret = [];
      for (let i = 0; i < length; i++) {
        ret.push(Math.floor(Math.random() * 100 % 100));
      }
      return ret;
    }


}