import { Component } from '@angular/core';
import { environment } from '../environments/environment';

import * as AOS from 'aos';
import { HttpClient } from '@angular/common/http';
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
    dataSourceUrl = 'https://storage.googleapis.com/cdc-covid-surveillance-broad-dashboard/metadata-cumulative.txt';
    data: any = {
      totalSamplesSequenced: 0,
      groupedByDate: [],
      slice: {
        data: [],
        timekeys: [],
        timeLabels: []
      },
      lastUpdated: '--',
      error: false
    };

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
      private http: HttpClient
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

      this.plotly = (window as any).Plotly;
    }

    ngOnInit() {
      this.http
        .get(this.dataSourceUrl, { responseType: 'text'})
        .subscribe(
          (data: any) => {
            this.parseData(data);
            this.initializeScalingChart();
            this.initializeVariantsChart();
          },
          (error) => {
            this.data.error = error;
            console.log('error', error)
          }
        );
    }

    ngAfterViewInit() {
      window.addEventListener('load', AOS.refreshHard);
    }

    //------------------------------------------------
    // Data
    // Assumption made that the raw data is provided in sorted order, since the sample file did this.
    //------------------------------------------------
    parseData(data: string) {
      let rows = data.split('\n');
      let colIndices = this.parseColData(rows.shift());
      let dateIndex = -1;

      rows.forEach((row) => {
        let rowArr = row.split('\t');
        let date = rowArr[colIndices.run_epiweek_end];
        let failed = rowArr[colIndices.genome_status] === 'failed_sequencing';
        let clade = rowArr[colIndices.nextclade_clade];
        let lineage = clade.indexOf('(') === -1
          ? rowArr[colIndices.pango_lineage]
          : clade;

        if (dateIndex === -1 || date !== this.data.groupedByDate[dateIndex][0]) {
          dateIndex++;
          this.data.groupedByDate.push([date]);
          this.data.lastUpdated = date;
        }

        if (!failed) {
          this.data.groupedByDate[dateIndex].push(lineage);
        }
      });

      this.data.totalSamplesSequenced = this.data.groupedByDate.reduce((a: number, b: string[]) => a + b.length - 1, 0);
      this.data.slice.data = this.data.groupedByDate.slice(-6);
      this.data.slice.timeKeys = this.data.slice.data.map((slice: any[]) => slice[0]);
      this.data.slice.timeLabels = this.data.slice.data.map((slice: any[]) => {
        return new Date(slice[0]).toLocaleDateString('en-US', {month: 'long', day: 'numeric'});
      });
    }

    parseColData(cols: string | undefined) {
      if (!cols) return {};

      let colsToTrack = [
        'pango_lineage',
        'run_epiweek_end',
        'genome_status',
        'nextclade_clade'
      ];
      let colIndices: any = {};
      let colsArr = cols.split('\t');
      colsArr.forEach((col, index) => {
        if (colsToTrack.indexOf(col) !== -1) {
          colIndices[col] = index;
        }
      });

      return colIndices;
    }

    //------------------------------------------------
    // Scaling Chart
    //------------------------------------------------
    initializeScalingChart() {
      let dataSlice = this.data.groupedByDate.slice(-6);

      let scalingChartWidth = Math.floor(Math.min(window.innerWidth, 1430) * 0.58);
      this.scalingData.time = this.data.slice.timeLabels;
      this.scalingData.weekly = this.data.slice.data.map((slice: any[]) => Math.max(0, slice.length - 1));
      let totalWeekly = this.scalingData.weekly.reduce((a: number, b: number) => a + b, 0);
      

      this.scalingData.cumulative = [this.data.totalSamplesSequenced - totalWeekly + this.scalingData.weekly[0]];
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
            l: 0, r: 80, t: 70
          }
        }
      };

      this.addVariantsData();
    }

    addVariantsData() {
      // Variables to determine the "other variants" count
      let variantsByTime: any = {};
      let variantsOfInterest: any = {};

      // Converting the raw data into chart data
      this.data.slice.data.forEach((variantsByDateArr: string[]) => {
        let date = variantsByDateArr[0];

        variantsByDateArr.forEach((variant: string, index: number) => {
          if (index === 0) {
            return;
          }

          let regExp = /\(([^)]+)\)/;
          let matches = variant.match(regExp);

          if (matches) {
            variant = matches[1];
            variantsOfInterest[variant] = 1;
          }
          else {
            variant = 'Other Variants';
          }

          if (!variantsByTime[variant]) {
            variantsByTime[variant] = {};
          }

          if (!variantsByTime[variant][date]) {
            variantsByTime[variant][date] = 0;
          }

          variantsByTime[variant][date]++;
        });
      });

      let variantColors = [
        '#eb9f4d', '#e84615', '#a83f02',
        '#f5c173', '#f26c3e', '#f11808',
        '#f1eb08', '#e0c602', '#fd9f3b'
      ]

      this.variantsData = {
        groups: [
          { title: 'Variants of High Consequence', values: [], visible: true },
          {
            title: 'Variants of Concern or Interest',
            values: Object.keys(variantsOfInterest).map((variant, idx) => {
              return { color: variantColors[idx], name: variant };
            }),
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
        time: this.data.slice.timeLabels
      };

      let stacks: number[] = this.variantsData.time.map(() => 0);
      this.variantsChart.data = [];
      this.variantsData.groups.forEach((group: any) => {
        group.values.map((val: any) => {
          if (!this.variantsChart.data) return;

          // save index so we know what indices to toggle visibility for
          val.index = this.variantsChart.data.length;
          val.origValues = this.data.slice.timeKeys.map((key: string) => {
            return variantsByTime[val.name][key] || 0;
          });
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