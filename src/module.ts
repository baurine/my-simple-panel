import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import defaultsDeep from 'lodash/defaultsDeep';
// @ts-ignore
import TimeSeries from 'grafana/app/core/time_series';

export default class SimpleCtrl extends MetricsPanelCtrl {
  static templateUrl = 'partials/module.html';

  panelDefaults = {
    lineWidth: 2,
    showPoints: true,
    pointRadius: 4,
  };

  data: any[] = [];

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    defaultsDeep(this.panel, this.panelDefaults);

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    // this.events.on('render', this.onRender.bind(this));
    // this.events.on('data-error', this.onDataError.bind(this));
  }

  onDataReceived(dataList: any) {
    console.log('onDataReceived:', dataList);
    this.data = dataList.map(this.seriesHandler.bind(this));
    console.log('onDataReceived series:', this.data);

    this.render();
  }

  seriesHandler(seriesData: any) {
    const series = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target,
    });
    series.flotpairs = series.getFlotPairs('connected');
    return series;
  }

  onInitEditMode() {
    console.log('onInitEditMode');
    this.addEditorTab('Options', `public/plugins/${this.pluginId}/partials/options.html`, 2);
  }

  // onRender() {
  //   // Tells the screen capture system that you finished
  //   this.renderingCompleted();
  // }

  // onDataError(err: any) {
  //   console.log('onDataError', err);
  // }
}

export { SimpleCtrl as PanelCtrl };
