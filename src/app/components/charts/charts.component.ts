import { Component, effect, ElementRef, EventEmitter, Input, input, model, OnChanges, Output, signal, SimpleChanges, ViewChild, ViewChildren, QueryList, OnDestroy, NgZone, inject } from '@angular/core';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Sortable from 'sortablejs';
import { AdAccount, Metric } from 'src/app/interfaces/report-sections.interfaces';

interface GraphsAdAccount {
  id: string
  name: string
  graphs: GraphConfig[]
  enabled: boolean
  order: number
}

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
export class ChartsComponent implements OnChanges, OnDestroy {

  private sortablesByAdAccountId: Map<string, Sortable> = new Map();

  @ViewChildren('chartsGridContainer') chartsGridContainers!: QueryList<ElementRef<HTMLElement>>;

  graphs = input<any[]>([]);
  @Input() adAccounts: AdAccount[] = [];
  @Output() adAccountsChange = new EventEmitter<AdAccount[]>();
  isViewMode = input<boolean>(false);

  graphConfigs: GraphConfig[] = [];

  private chartRefs: Record<string, Chart> = {};

  adAccountsGraphs = signal<GraphsAdAccount[]>([]);

  private ngZone = inject(NgZone);

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['adAccounts']) {
      console.log("adAccounts changed", changes['adAccounts'])
      this.initializeGraphs();
    }
  }

  ngOnDestroy(): void {
    this.destroyAllSortables();
  }

  private initSortables(): void {
    const disableDragging = this.isViewMode();

    this.chartsGridContainers?.forEach((containerRef: ElementRef<HTMLElement>) => {
      const containerEl = containerRef.nativeElement;
      const adAccountId = containerEl.getAttribute('data-adaccount-id') || '';

      const existing = this.sortablesByAdAccountId.get(adAccountId);
      if (existing) {
        existing.destroy();
        this.sortablesByAdAccountId.delete(adAccountId);
      }

      const sortable = this.ngZone.runOutsideAngular(() => Sortable.create(containerEl, {
        animation: 150,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        group: { name: `graphs-${adAccountId}`, pull: false, put: false },
        handle: '.graph-card',
        draggable: '.graph-card',
        disabled: disableDragging,
        onEnd: (event) => this.ngZone.run(() => this.onReorderEnd(event, adAccountId)),
      }));

      this.sortablesByAdAccountId.set(adAccountId, sortable);
    });
  }

  private destroyAllSortables(): void {
    this.sortablesByAdAccountId.forEach((s) => s.destroy());
    this.sortablesByAdAccountId.clear();
  }

  initializeGraphs() {
    setTimeout(() => {
      const adAccounts = this.adAccounts;

      this.adAccountsGraphs.set([]);

      for (let adAccount of adAccounts) {
        const metrics = (adAccount.metrics || []).filter(m => m.enabled).sort((a, b) => a.order - b.order);
        const graphConfigs = this.getGraphConfigs();

        this.adAccountsGraphs.update(prev => [...prev, {
          id: adAccount.id,
          name: adAccount.name,
          graphs: [],
          enabled: adAccount.enabled,
          order: adAccount.order
        }]);

        let graphs: GraphConfig[] = [];

        for (const metric of metrics) {
          let config = graphConfigs.find(c => c.metric === metric.name);

          if (!config) {
            config = { metric: metric.id || '', label: metric.name, color: '#77B6FB', format: (v: any) => `${v}` }
          }

          graphs.push({
            ...config,
            ...metric,
          })

          this.adAccountsGraphs.update(prev => {
            const lastIndex = prev.length - 1;
            prev[lastIndex].graphs = graphs;
            return prev;
          });
        }
        this.adAccountsGraphs.update(prev => prev.sort((a: any, b: any) => a.order - b.order));
      }

      // Render and wire up drag after DOM updates
      setTimeout(() => {
        this.renderCharts();
        this.destroyAllSortables();
        this.initSortables();
        this.chartsGridContainers?.changes?.subscribe(() => {
          this.destroyAllSortables();
          this.initSortables();
        });
      }, 0);
    }, 50);
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


    for (const adAccount of this.adAccountsGraphs()) {
      for (const config of adAccount.graphs) {
        const canvases = document.querySelectorAll(`#Chart${config.metric}`);
        
        if (!canvases.length) continue;
  
        let currentCanvas = canvases[canvases.length - 1];
        let canvasId = `Chart${config.metric}-${canvases.length}`
        currentCanvas.id = canvasId;
  
        let data = this.graphs().map(g => parseFloat(g[config.metric]) || Math.random() * 1000);
        
        this.chartRefs[canvasId]?.destroy();
  
        this.chartRefs[canvasId] = new Chart(currentCanvas as HTMLCanvasElement, {
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
                  label: (ctx: any) => config.format(ctx.parsed.y.toFixed(2))
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
                  callback: (value: any) => config.format(Number(value).toFixed(0)),
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
    
  }

  private onReorderEnd(event: Sortable.SortableEvent, adAccountId: string): void {
    // Update metric.order inside the bound adAccounts and emit changes
    const updatedAdAccounts = this.adAccounts.map((acc) => {
      if (String(acc.id) !== String(adAccountId)) return acc;

      const allMetrics: Metric[] = [...acc.metrics];
      const enabledPositions: number[] = [];
      const enabledMetrics: Metric[] = [];
      for (let i = 0; i < allMetrics.length; i++) {
        if (allMetrics[i].enabled) {
          enabledPositions.push(i);
          enabledMetrics.push({ ...allMetrics[i] });
        }
      }

      const oldIdx = (event as any).oldDraggableIndex ?? event.oldIndex ?? 0;
      const newIdx = (event as any).newDraggableIndex ?? event.newIndex ?? 0;
      if (oldIdx !== newIdx) {
        const moved = enabledMetrics.splice(oldIdx, 1)[0];
        enabledMetrics.splice(newIdx, 0, moved);
      }

      const resultMetrics: Metric[] = allMetrics.map(m => ({ ...m }));
      for (let i = 0; i < enabledPositions.length; i++) {
        const pos = enabledPositions[i];
        resultMetrics[pos] = { ...enabledMetrics[i] };
      }

      for (let i = 0; i < resultMetrics.length; i++) {
        resultMetrics[i].order = i;
      }

      return { ...acc, metrics: resultMetrics } as AdAccount;
    });

    this.adAccountsChange.emit(updatedAdAccounts);

    // Re-render charts to reflect new ordering
    this.adAccounts = updatedAdAccounts;
    this.initializeGraphs();
  }
}
