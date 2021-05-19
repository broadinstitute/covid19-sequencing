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
    plotly: any;

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

    scalingChartId = 'scaling-chart';
    scalingChartMode: 'weekly' | 'combined' = 'combined';
    scalingChart: { data?: any[], layout?: {}} = {};
    scalingData: { time?: any[], cumulative?: any, weekly?: any} = {};
    variantsChart: { data?: any[], layout?: {}} = {};
    variantsData: any = {};

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
      this.plotly = (window as any).Plotly;
    }

    ngOnInit() {
      this.initializeScalingChart();
      this.initializeVariantsChart();
    }

    //------------------------------------------------
    // Scaling Chart
    //------------------------------------------------
    initializeScalingChart() {
      let scalingChartWidth = Math.floor(Math.min(window.innerWidth, 1430) * 0.58);
      this.scalingData.time = ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26'];
      this.scalingData.weekly = this.getRandomArray(6);
      this.scalingData.cumulative = [this.scalingData.weekly[0]];
      this.scalingData.weekly.forEach((val: any, i: number) => {
        if (i !== 0) {
          this.scalingData.cumulative[i] = val + this.scalingData.cumulative[i-1];
        }
      });      

      this.scalingChart = {
        data: [],
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
            l: 0, r: 0, t: 30
          }
        }
      };

      this.addCumulativeSeries();
      this.addWeeklySeries();
    }

    addCumulativeSeries() {
      if (!this.scalingChart.data) return;

      this.scalingChart.data.push({
        x: this.scalingData.time,
        y: this.scalingData.cumulative,
        text: this.scalingData.cumulative,
        textposition: 'top',
        type: 'scatter',
        mode: 'lines+markers+text',
        marker: {color: 'orange'},
        name: 'Cumulative',
        hoverinfo: 'skip'
      });
    }

    addWeeklySeries() {
      if (!this.scalingChart.data) return;

      this.scalingChart.data.push({
        x: this.scalingData.time,
        y: this.scalingData.weekly,
        textposition: 'auto',
        type: 'bar',
        marker: { color: '#046db6' },
        mode: 'markers+text',
        name: '',
        hoverinfo: 'skip',
        hovertemplate: `  <b>Week Count:</b>  <br>  %{y}  `
      });
    }

    toggleCumulative() {
      this.scalingChartMode = this.scalingChartMode === 'combined' ? 'weekly' : 'combined';
      let newY;
      let cb;
      let chart = document.getElementById(this.scalingChartId);

      if (this.scalingChartMode === 'combined') {
        newY = Math.max(...this.scalingData.cumulative);
        let weeklyUpdate = {
          text: null,
          hovertemplate: `  <b>Week Count:</b>  <br>  %{y}  `,
        };
        this.plotly.restyle(chart, weeklyUpdate, [1]);
        this.plotly.restyle(chart, {'visible': true}, [0]);
        cb = () => {};
      }
      else {
        newY = Math.max(...this.scalingData.weekly);
        let weeklyUpdate = {
          text: [this.scalingData.weekly],
          hovertemplate: null,
        };
        this.plotly.restyle(chart, {'visible': false}, [0]);
        cb = () => {this.plotly.restyle(chart, weeklyUpdate, [1]); };
      }

      this.plotly
        .animate(this.scalingChartId, { layout: { yaxis: { range: [0, newY + 20] } } })
        .then(cb);
    }

    //------------------------------------------------
    // Variants Chart
    //------------------------------------------------
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

    //------------------------------------------------
    // Helpers
    //------------------------------------------------
    getRandomArray(length: number) {
      let ret = [];
      for (let i = 0; i < length; i++) {
        ret.push(Math.floor(Math.random() * 100 % 100));
      }
      return ret;
    }


}