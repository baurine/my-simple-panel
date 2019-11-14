import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import defaultsDeep from 'lodash/defaultsDeep';
// @ts-ignore
import TimeSeries from 'grafana/app/core/time_series';
// 新的实现
// grafana 主仓库里这两个方法是在 @grafana/data 里，估计 6.4 以后要从 '@grafana/data' 中导入
import { getValueFormats, getValueFormat } from '@grafana/ui';
// 老的实现
import kbn from 'grafana/app/core/utils/kbn';

export default class SimpleCtrl extends MetricsPanelCtrl {
  static templateUrl = 'partials/module.html';

  panelDefaults = {
    lineWidth: 2,
    showPoints: true,
    pointRadius: 4,
    curUnitFormat: 's',
  };

  data: any[] = [];
  unitFormats: any;

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

    // 下面两者等价
    console.log('kbn.getUnitFormats():', kbn.getUnitFormats());
    console.log('getValueFormats:', getValueFormats());

    // https://github.com/grafana/piechart-panel/blob/master/src/piechart_ctrl.ts#L61
    // this.unitFormats = kbn.getUnitFormats();
    this.unitFormats = getValueFormats();

    this.addEditorTab('Options', `public/plugins/${this.pluginId}/partials/options.html`, 2);
  }

  // onRender() {
  //   // Tells the screen capture system that you finished
  //   this.renderingCompleted();
  // }

  // onDataError(err: any) {
  //   console.log('onDataError', err);
  // }

  setUnitFormat(subItem: any) {
    console.log('setUnitFormat:', subItem);

    this.panel.curUnitFormat = subItem.value;
    this.render();
  }

  getDecimalsForValue(value: any) {
    // if (_.isNumber(this.panel.decimals)) {
    //   return { decimals: this.panel.decimals, scaledDecimals: null };
    // }

    const delta = value / 2;
    let dec = -Math.floor(Math.log(delta) / Math.LN10);

    const magn = Math.pow(10, -dec);
    const norm = delta / magn; // norm is between 1.0 and 10.0
    let size;

    if (norm < 1.5) {
      size = 1;
    } else if (norm < 3) {
      size = 2;
      // special case for 2.5, requires an extra decimal
      if (norm > 2.25) {
        size = 2.5;
        ++dec;
      }
    } else if (norm < 7.5) {
      size = 5;
    } else {
      size = 10;
    }

    size *= magn;

    // reduce starting decimals if not needed
    if (Math.floor(value) === value) {
      dec = 0;
    }

    const result = {
      decimals: 0,
      scaledDecimals: 0,
    };
    result.decimals = Math.max(0, dec);
    result.scaledDecimals = result.decimals - Math.floor(Math.log(size) / Math.LN10) + 2;

    return result;
  }

  // 单位换算，在后面绘图时要用到这个函数
  formatValue(value: any) {
    // getDecimalsForValue() 具体实现看源码吧
    // 大致是用来计算该保留几位小数点合适，具体算法我也还没太整明白
    const decimalInfo = this.getDecimalsForValue(value);
    // 获取当前单位对应的转换函数
    // const formatFunc = kbn.valueFormats[this.panel.curUnitFormat];
    const formatFunc = getValueFormat(this.panel.curUnitFormat);
    if (formatFunc) {
      return formatFunc(value, decimalInfo.decimals, decimalInfo.scaledDecimals);
    }
    return value;
  }
}

export { SimpleCtrl as PanelCtrl };
