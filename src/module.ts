import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import defaultsDeep from 'lodash/defaultsDeep';

export default class SimpleCtrl extends MetricsPanelCtrl {
  static templateUrl = 'partials/module.html';

  panelDefaults = {
    text: 'Hello World',
  };

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    defaultsDeep(this.panel, this.panelDefaults);

    this.events.on('data-received', this.onDataReceived.bind(this));
    // this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    // this.events.on('render', this.onRender.bind(this));
    // this.events.on('data-error', this.onDataError.bind(this));
  }

  onDataReceived(dataList: any) {
    console.log('onDataReceived:', dataList);
  }

  // onInitEditMode() {
  //   this.addEditorTab('Options', `public/plugins/${this.pluginId}/partials/options.html`, 2);
  // }

  // onRender() {
  //   // Tells the screen capture system that you finished
  //   this.renderingCompleted();
  // }

  // onDataError(err: any) {
  //   console.log('onDataError', err);
  // }
}

export { SimpleCtrl as PanelCtrl };
