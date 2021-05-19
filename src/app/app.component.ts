import { Component, ViewEncapsulation } from '@angular/core';
import { environment } from '../environments/environment';

import * as AOS from 'aos';
import { ViewportScroller } from '@angular/common';
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
    navbarLinks = [
      { title: 'dashboard', id: 'header-container' },
      { title: 'about us', id: 'broad-container' },
      { title: 'methods', id: 'methods-container' },
      { title: 'resources', id: 'resources-container' },
      { title: 'acknowledgments', id: 'acknowledgments-container' }
    ];

    // Scroll helpers
    sectionsLoaded: any = {};
    activeSection = 'header-container';

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

    variantsChartId = 'variants-chart';
    variantsChart: { data?: any[], layout?: {}} = {};
    variantsData: any = {};

    constructor(
      private viewportScroller: ViewportScroller
    ) {
      this.env = environment;
      AOS.init({
        offset: 200,
        duration: 300,
        easing: 'ease-in-sine',
        delay: 0,
        disable: 'mobile',
        once: true
      });

      this.initScrollBehavior();
      this.plotly = (window as any).Plotly;
    }

    ngOnInit() {
      this.initializeScalingChart();
      this.initializeVariantsChart();
    }

    //------------------------------------------------
    // Site Behavior
    //------------------------------------------------
    initScrollBehavior() {
      // AOS library says there should be "aos:out" events triggered,
      // but for some reason they werent being emitted.
      document.addEventListener('transitionend', (event: any) => {
        if (event.srcElement.dataset.aos && event.propertyName === 'transform') {
          this.sectionsLoaded[event.srcElement.id] = true;
        }
      });

      document.addEventListener('scroll', () => { this.storeScroll(); }, { passive: true });
      this.storeScroll();
    }

    scrollToId(id: string, event: any) {
      let element = document.getElementById(id);
      if (!element) return;

      let offset = this.sectionsLoaded[id] ? 0 : -90;
      let headerOffset = -60;
      let y = Math.max(0, element?.getBoundingClientRect().top + window.pageYOffset + offset + headerOffset);
      window.scrollTo({top: y, behavior: 'smooth'});
      event.srcElement.blur();
    }

    // Reads out the scroll position and stores it in the data attribute
    // so we can use it in our stylesheets
    storeScroll() {
      (document as any).documentElement.dataset.scroll = window.scrollY;

      let links = this.navbarLinks;
      for (let link of links) {
        let element = document.getElementById(link.id);
        if (!element) return;

        let offset = this.sectionsLoaded[link.id] ? -10 : -100;
        let headerOffset = -60;
        let y = Math.max(0, element?.getBoundingClientRect().top + window.pageYOffset) + offset + headerOffset;

        if (y < window.scrollY) {
          this.activeSection = link.id;
        }
        else {
          break;
        }
      }
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
          height: scalingChartWidth * .7,
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
          },
          font: {
            family: 'Lato',
            size: 16
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
      let chart = document.getElementById(this.scalingChartId);

      if (this.scalingChartMode === 'combined') {
        let weeklyUpdate = {
          text: null,
          hovertemplate: `  <b>Week Count:</b>  <br>  %{y}  `,
        };
        this.plotly.restyle(chart, weeklyUpdate, [1]);
        this.plotly.restyle(chart, {visible: true}, [0]);
        this.plotly.animate(this.scalingChartId, { layout: { yaxis: { range: [0, Math.max(...this.scalingData.cumulative) + 20] } } });
      }
      else {
        let weeklyUpdate = {
          text: [this.scalingData.weekly],
          hovertemplate: null,
        };
        this.plotly.restyle(chart, {visible: false}, [0]);
        this.plotly
          .animate(this.scalingChartId, { layout: { yaxis: { range: [0, Math.max(...this.scalingData.weekly) + 20] } } })
          .then(() => {
            this.plotly.restyle(chart, weeklyUpdate, [1]);
          })
      }
    }

    //------------------------------------------------
    // Variants Chart
    //------------------------------------------------
    initializeVariantsChart() {
      let variantsChartWidth = Math.min(window.innerWidth, 1200) - 260;
      this.variantsChart = {
        data: [],
        layout: {
          width: variantsChartWidth,
          height: Math.min(variantsChartWidth * .6, 585),
          xaxis: {
            title: 'Count'
          },
          yaxis: {
            title: 'Count of Samples Sequenced',
          },
          barmode: 'stack',
          bargap: .35,
          bargroupgap: 4,
          showlegend: false,
          margin: {
            l: 50, r: 80, t: 70
          }
        }
      };

      this.addVariantsData();
    }

    addVariantsData() {
      this.variantsData = {
        groups: [
          { title: 'Variants of High Consequence', values: [], visible: true },
          {
            title: 'Variants of Concern',
            values: [
              { color: '#eb9f4d', name: 'B.1.1.7', desc: '20I/501Y.V1' },
              { color: '#e84615', name: 'P.1', desc: '2-J/501Y.V3' },
              { color: '#a83f02', name: 'B.1.351', desc: '20H/501.V2' },
              { color: '#f5c173', name: 'B.1.427', desc: '20C/S:452R' },
              { color: '#f26c3e', name: 'B.1.429', desc: '20H/20C/S:452R.V2' }
            ],
            visible: true
          },
          {
            title: 'Variants of Interest',
            values: [
              { color: '#4c6e32', name: 'B.1.526', desc: '20C' },
              { color: '#5bb56b', name: 'B.1.525', desc: '20C' },
              { color: '#256323', name: 'P.2', desc: '20J' }
            ],
            visible: true
          },
          {
            title: 'Other',
            values: [
              { color: '#046db6', name: 'Other Variants' }
            ],
            visible: true
          }
        ],
        time: ['March 22', 'March 29', 'April 5', 'April 12', 'April 19', 'April 26']
      };

      let stacks: number[] = this.variantsData.time.map(() => 0);
      this.variantsChart.data = [];
      this.variantsData.groups.forEach((group: any) => {
        group.values.map((val: any) => {
          if (!this.variantsChart.data) return;

          // save index so we know what indices to toggle visibility for
          val.index = this.variantsChart.data.length;
          val.origValues = this.getRandomArray(6);
          val.origValues.forEach((val: number, index: number) => stacks[index] += val);

          this.variantsChart.data.push({
            x: this.variantsData.time,
            y: val.origValues,
            type: 'bar',
            marker: { color: val.color },
            name: val.name
          });
        });
      });

      (this.variantsChart.layout as any).yaxis.range = [0, Math.max(...stacks) * 1.1];
    }

    toggleGroupVisibility(group: any) {
      // this is just really complex in order to get animations to work...
      // you have to update the data for animations. Otherwise, if you just
      // toggle visibility, it blinks in and out. Just doesn't look as good!
      if (!this.variantsChart.data) return;

      let emptyArray = { y: this.variantsData.time.map(() => 0) };
      let dataUpdate = this.variantsChart.data.map((d: any) => { return { y: d.y }});
      let indices: number[] = [];
      group.values.forEach((val: any) => {
        let newValue = group.visible ? { y: val.origValues } : emptyArray;
        dataUpdate[val.index] = newValue;
        indices.push(val.index);
      });

      let chart = document.getElementById(this.variantsChartId);

      // More shenanigans to make it animate well.
      // Restyle is necessary to remove the traces from the tooltips
      if (group.visible) {
        this.plotly
          .restyle(chart, {visible: group.visible}, indices)
          .then(() => this.plotly.animate(this.variantsChartId, { data: dataUpdate }));
      }
      else {
        this.plotly
          .animate(this.variantsChartId, { data: dataUpdate })
          .then(() => this.plotly.restyle(chart, {visible: group.visible}, indices));
      }
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