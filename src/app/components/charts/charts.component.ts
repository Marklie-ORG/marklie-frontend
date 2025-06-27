import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { MockData, ReportSection } from 'src/app/pages/schedule-report/schedule-report.component';
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
  }

  @Input() data: MockData | undefined = undefined;
  @Input() reportSections: ReportSection[] = [];

  graphConfigs: GraphConfig[] = [];

  private chartRefs: Record<string, Chart> = {};

  displayedGraphs: GraphConfig[] = [];

  initializeGraphs() {
    setTimeout(() => {
      if (!this.reportSections.length) return
      const metrics = this.reportSections.find(s => s.key === 'graphs')?.metrics.filter(m => m.enabled) || [];
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

  ngAfterViewInit(): void {
    this.initializeGraphs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportSections']) {
      this.initializeGraphs();
    }
  }

  getGraphConfigs() {
    return [
      { metric: 'spend', label: 'Daily Spend', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'purchase_roas', label: 'ROAS', color: '#77B6FB', format: (v: any) => `${v}x` },
      { metric: 'conversion_value', label: 'Conversion Value', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'purchases', label: 'Purchases', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'addToCart', label: 'Add to Cart', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'initiatedCheckouts', label: 'Checkouts', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'clicks', label: 'Clicks', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'impressions', label: 'Impressions', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'ctr', label: 'Click Through Rate', color: '#77B6FB', format: (v: any) => `${v}%` },
      { metric: 'cpm', label: 'Cost Per Mile', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'cpc', label: 'CPC', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'cpp', label: 'CPP', color: '#77B6FB', format: (v: any) => `$${v}` },
      { metric: 'reach', label: 'Reach', color: '#77B6FB', format: (v: any) => `${v}` },
      { metric: 'costPerPurchase', label: 'Cost Per Purchase', color: '#77B6FB', format: (v: any) => `$${v}` },
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
    if (!this.data || !this.data.graphs?.length) return;

    const labels = this.data.graphs.map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const config of this.displayedGraphs) {
      const canvasId = `${config.metric}Chart`;
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) continue;

      const data = this.data.graphs.map(g => parseFloat(g[config.metric]) || 0);

      this.chartRefs[canvasId]?.destroy();

      this.chartRefs[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: config.label,
            data,
            borderColor: config.color,
            pointBackgroundColor: config.color,
            pointRadius: 2,
            tension: 0.3,
            fill: false,
            pointStyle: 'circle',
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: config.color,
            pointHoverBackgroundColor: config.color,
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: config.label,
              font: { size: 16, family: 'Inter Variable, sans-serif', weight: 'normal' },
              color: '#000000',
              padding: {
                top: 0,
                bottom: 25
              }
            },
            tooltip: {
              callbacks: {
                label: ctx => config.format(ctx.parsed.y.toFixed(2))
              }
            },
            datalabels: { display: false },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: value => config.format(Number(value).toFixed(0)),
                font: { family: 'Inter Variable, sans-serif' }
              },
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              ticks: { font: { family: 'Inter Variable, sans-serif' } },
              grid: { color: 'rgba(0,0,0,0.05)' }
            }
          },
          layout: {
            padding: {
              left: 0,
              right: 0,
              top: 0,
              bottom: 0
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    }
  }

  reorderItems(event: Sortable.SortableEvent) {
    
    const movedItem = this.displayedGraphs.splice(event.oldIndex!, 1)[0];
    this.displayedGraphs.splice(event.newIndex!, 0, movedItem);
    this.displayedGraphs.forEach((m, index) => m.order = index);

    const metrics = this.reportSections.find(s => s.key === 'graphs')?.metrics!;
    for (let [index, metric] of metrics.entries()) {
      
      const order = this.displayedGraphs.findIndex(g => g.name === metric.name);
      if (order !== -1) {
        metric.order = order;
      }
      else {
        metric.order = this.displayedGraphs.length + index; 
      }
    }

    this.reportSections.find(s => s.key === 'graphs')?.metrics.sort((a, b) => a.order - b.order);
  }

}
