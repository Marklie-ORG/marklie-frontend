import { Component, Input, SimpleChanges } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Chart } from 'chart.js';
import { MockData } from 'src/app/pages/schedule-report/schedule-report.component';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MetricSelections } from '../edit-report-content/edit-report-content.component';

interface GraphConfig {
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

  @Input() data: MockData | undefined = undefined;
  @Input() metricSelections: MetricSelections | undefined = undefined;

  graphConfigs: GraphConfig[] = [];

  private chartRefs: Record<string, Chart> = {};

  initializeGraphs() {
    setTimeout(() => {
      if (!this.metricSelections) return
      const { graphs } = this.metricSelections;
      this.graphConfigs = this.getGraphConfigs().filter(config => graphs[config.metric]);
      setTimeout(() => this.renderCharts(), 0);
    }, 100);
  }

  ngAfterViewInit(): void {
    this.initializeGraphs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['metricSelections']) {
      this.initializeGraphs();
    }
  }

  getGraphConfigs() {
    return [
      { metric: 'spend', label: 'Daily Spend', color: '#1F8DED', format: (v: any) => `$${v}` },
      { metric: 'purchase_roas', label: 'ROAS', color: '#2ecc71', format: (v: any) => `${v}x` },
      { metric: 'conversion_value', label: 'Conversion Value', color: '#c0392b', format: (v: any) => `$${v}` },
      { metric: 'purchases', label: 'Purchases', color: '#e74c3c', format: (v: any) => `${v}` },
      { metric: 'addToCart', label: 'Add to Cart', color: '#f1c40f', format: (v: any) => `${v}` },
      { metric: 'initiatedCheckouts', label: 'Checkouts', color: '#9b59b6', format: (v: any) => `${v}` },
      { metric: 'clicks', label: 'Clicks', color: '#e67e22', format: (v: any) => `${v}` },
      { metric: 'impressions', label: 'Impressions', color: '#1abc9c', format: (v: any) => `${v}` },
      { metric: 'ctr', label: 'Click Through Rate', color: '#34495e', format: (v: any) => `${v}%` },
      { metric: 'cpm', label: 'Cost Per Mile', color: '#34495e', format: (v: any) => `$${v}` },
      { metric: 'cpc', label: 'CPC', color: '#16a085', format: (v: any) => `$${v}` },
      { metric: 'cpp', label: 'CPP', color: '#16a085', format: (v: any) => `$${v}` },
      { metric: 'reach', label: 'Reach', color: '#16a085', format: (v: any) => `${v}` },
      { metric: 'costPerPurchase', label: 'Cost Per Purchase', color: '#8e44ad', format: (v: any) => `$${v}` },
      { metric: 'costPerCart', label: 'Cost Per Add to Cart', color: '#d35400', format: (v: any) => `$${v}` },
      { metric: 'add_to_cart', label: 'Add to Cart', color: '#f1c40f', format: (v: any) => `${v}` },
      { metric: 'initiated_checkouts', label: 'Initiated Checkouts', color: '#9b59b6', format: (v: any) => `${v}` },
      { metric: 'engagement', label: 'Engagement', color: '#3498db', format: (v: any) => `${v}` },
      { metric: 'cost_per_purchase', label: 'Cost Per Purchase', color: '#8e44ad', format: (v: any) => `$${v}` },
      { metric: 'cost_per_add_to_cart', label: 'Cost Per Add to Cart', color: '#d35400', format: (v: any) => `$${v}` },
      { metric: 'conversion_rate', label: 'Conversion Rate', color: '#27ae60', format: (v: any) => `${v}%` },
    ];
  }

  dropGraphCard(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.graphConfigs, event.previousIndex, event.currentIndex);
    setTimeout(() => this.renderCharts(), 100);
  }

  private renderCharts(): void {
    if (!this.data || !this.data.graphs?.length) return;

    const labels = this.data.graphs.map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const config of this.graphConfigs) {
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
            pointRadius: 3,
            tension: 0.3,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: config.label,
              font: { size: 16, family: 'Inter Variable, sans-serif' }
            },
            tooltip: {
              callbacks: {
                label: ctx => config.format(ctx.parsed.y.toFixed(2))
              }
            },
            datalabels: { display: false }
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
          }
        },
        plugins: [ChartDataLabels]
      });
    }
  }

}
