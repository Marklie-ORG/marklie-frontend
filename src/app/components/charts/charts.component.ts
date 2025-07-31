import { Component, effect, ElementRef, input, model, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Sortable from 'sortablejs';
import { Metric } from 'src/app/services/api/report.service';

interface GraphConfig extends Metric {
  metric: string;
  label: string;
  color: string;
  format: (v: any) => string;
}

@Component({
  selector: 'charts',
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss'
})
export class ChartsComponent {

  private sortable: Sortable | null = null;

  @ViewChild('chartsGridContainer', { static: false }) set gridContainer(el: ElementRef | undefined) {
    if (this.sortable) {
      this.sortable.destroy();
      this.sortable = null;
    }

    if (el) {
      this.sortable = Sortable.create(el.nativeElement, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (event) => this.reorderItems(event),
      });
    }

    if (this.isViewMode()) {
      this.sortable?.option('disabled', true);
    }
  }

  graphs = input<any[]>([]);
  metrics = model<Metric[]>([]);
  isViewMode = input<boolean>(false);

  graphConfigs: GraphConfig[] = [];

  private chartRefs: Record<string, Chart> = {};

  displayedGraphs: GraphConfig[] = [];

  constructor() {
    effect(() => {
      if (this.metrics().length) {
        this.initializeGraphs();
      }
    });
  }


  initializeGraphs() {
    setTimeout(() => {
      console.log(this.metrics())
      if (!this.metrics().length) return
      const metrics = this.metrics().filter(m => m.enabled) || [];
      const graphConfigs = this.getGraphConfigs();
      this.displayedGraphs = [];
      for (const metric of metrics) {
        const config = graphConfigs.find(c => c.metric === metric.name);
        if (config) {
          this.displayedGraphs.push({
            ...config,
            ...metric,
          });
        }
      }
      this.displayedGraphs.sort((a, b) => a.order - b.order);

      setTimeout(() => this.renderCharts(), 0);
    }, 100);
  }

  getGraphConfigs() {
    return [
      { metric: 'spend', label: 'Daily Spend', color: '#77B6FB', format: (v: any) => `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
      { metric: 'purchase_roas', label: 'ROAS', color: '#77B6FB', format: (v: any) => `${parseFloat(v).toFixed(1)}` },
      { metric: 'conversion_value', label: 'Conversion Value', color: '#77B6FB', format: (v: any) => `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
      { metric: 'purchases', label: 'Purchases', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'addToCart', label: 'Add to Cart', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'initiatedCheckouts', label: 'Checkouts', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'clicks', label: 'Clicks', color: '#77B6FB', format: (v: any) => `${Math.round(v).toLocaleString()}` },
      { metric: 'impressions', label: 'Impressions', color: '#77B6FB', format: (v: any) => `${Math.round(v).toLocaleString()}` },      { metric: 'ctr', label: 'Click Through Rate', color: '#77B6FB', format: (v: any) => `${v}%` },
      { metric: 'cpm', label: 'Cost Per Mile', color: '#77B6FB', format: (v: any) => `$${parseFloat(v).toFixed(2)}` },
      { metric: 'cpc', label: 'CPC', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'cpp', label: 'CPP', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'reach', label: 'Reach', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'costPerPurchase', label: 'Cost Per Purchase', color: '#77B6FB', format: (v: any) => `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
      { metric: 'costPerCart', label: 'Cost Per Add to Cart', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'add_to_cart', label: 'Add to Cart', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'initiated_checkouts', label: 'Initiated Checkouts', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'engagement', label: 'Engagement', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'cost_per_purchase', label: 'Cost Per Purchase', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'cost_per_add_to_cart', label: 'Cost Per Add to Cart', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'conversion_rate', label: 'Conversion Rate', color: '#77B6FB', format: (v: any) => `${v}%` },
    ];
  }

  private renderCharts(): void {
    if (!this.graphs()?.length) return;

    const labels = this.graphs().map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const config of this.displayedGraphs) {
      const canvases = document.querySelectorAll(`#${config.metric}Chart`);
      if (!canvases.length) continue;

      const currentCanvas = canvases[canvases.length - 1];
      const canvasId = `${config.metric}Chart-${canvases.length}`;
      currentCanvas.id = canvasId;

      const data = this.graphs().map(g => parseFloat(g[config.metric]) || 0);
      const minValue = Math.min(...data);
      const maxValue = Math.max(...data);
      const range = maxValue - minValue;
      const padding = range * 0.2;

      const labels = this.graphs().map(g =>
        new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );

      this.chartRefs[canvasId] = new Chart(currentCanvas as HTMLCanvasElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: config.label,
            data,
            borderColor: '#77B6FB',
            pointBackgroundColor: "#5293D9",
            pointRadius: 2,
            tension: 0.4,
            fill: false,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: config.label,
              font: { size: 18, weight: 'bold' },
              color: '#000000',
              align: 'center',
              padding: {bottom: 30 }
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: ctx => config.format(ctx.parsed.y.toFixed(2))
              }
            },
            datalabels: {
              display: true,
              clip: false,
              color: config.color,
              font: {
                size: 11,
                weight: 'bold',
                family: 'Inter Variable, sans-serif'
              },
              align: (ctx) => {
                const data = ctx.chart.data.datasets[0].data as number[];
                const index = ctx.dataIndex;
                const current = data[index];
                const prev = data[index - 1] ?? current;
                const next = data[index + 1] ?? current;

                if (current > prev && current > next) return 'top';
                if (current < prev && current < next) return 'bottom';
                if (Math.abs(current - prev) < 10 && Math.abs(current - next) < 10) return 'bottom';

                return 'top';
              },
              anchor: 'end',
              offset: 6,
              formatter: (value: any) => config.format(value)
            }
          },
          scales: {
            x: {
              grid: {
                display: true
              },
              ticks: {
                font: { family: 'Inter Variable, sans-serif' },
                padding: 14, // default is ~3–5; reduce to ~10 if needed

              }
            },
            y: {
              beginAtZero: false,
              ticks: {
                stepSize: 0.01,
                maxTicksLimit: 4,
                font: { family: 'Inter Variable, sans-serif' },

                  padding: 22, // default is ~3–5; reduce to ~10 if needed

              },
              grid: {
                color: 'rgba(0,0,0,0.05)',
                drawTicks: false
              },
              border: {
                display: false
              }
            }
          },
          layout: {
            padding: {
              left: 6,    // ensures labels don't touch y-ticks
              right: 26,
              top: 6,
              bottom: 0
            }
          },
        },
        plugins: [ChartDataLabels]
      });
    }
  }

  reorderItems(event: Sortable.SortableEvent) {

    const movedItem = this.displayedGraphs.splice(event.oldIndex!, 1)[0];
    this.displayedGraphs.splice(event.newIndex!, 0, movedItem);
    this.displayedGraphs.forEach((m, index) => m.order = index);

    for (let [index, metric] of this.metrics().entries()) {

      const order = this.displayedGraphs.findIndex(g => g.name === metric.name);
      if (order !== -1) {
        metric.order = order;
      }
      else {
        metric.order = this.displayedGraphs.length + index;
      }
    }

    this.metrics.set(this.metrics().sort((a, b) => a.order - b.order));
  }

}
