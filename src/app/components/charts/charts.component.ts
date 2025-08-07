import { Component, effect, ElementRef, EventEmitter, Input, input, model, OnChanges, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Sortable from 'sortablejs';
import { AdAccount, Metric } from 'src/app/interfaces/interfaces.js';

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
export class ChartsComponent implements OnChanges {

  private sortable: Sortable | null = null;

  // @ViewChild('chartsGridContainer', { static: false }) set gridContainer(el: ElementRef | undefined) {
  //   if (this.sortable) {
  //     this.sortable.destroy();
  //     this.sortable = null;
  //   }

  //   if (el) {
  //     this.sortable = Sortable.create(el.nativeElement, {
  //       animation: 200,
  //       easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
  //       ghostClass: 'sortable-ghost',
  //       dragClass: 'sortable-drag',
  //       onEnd: (event) => this.reorderItems(event),
  //     });
  //   }

  //   if (this.isViewMode()) {
  //     this.sortable?.option('disabled', true);
  //   }
  // }

  graphs = input<any[]>([]);
  // adAccounts = model<AdAccount[]>([]);
  @Input() adAccounts: AdAccount[] = [];
  @Output() adAccountsChange = new EventEmitter<AdAccount[]>();
  isViewMode = input<boolean>(false);

  graphConfigs: GraphConfig[] = [];

  private chartRefs: Record<string, Chart> = {};

  adAccountsGraphs = signal<GraphsAdAccount[]>([]);

  constructor() {

    // if (this.adAccounts().length) {
    //   this.initializeGraphs();
    // }

    
    
    // effect(() => {
    //   console.log("hello")
    //   console.log(this.adAccounts())
    //   if (this.adAccounts().length) {
    //     console.log(this.adAccounts())
    //     this.initializeGraphs();
    //   }
    // });
    
    //   console.log(this.adAccounts())
    //   // this.initializeGraphs();
    //   // for (let adAccount of this.adAccounts()) {
    //   //   if (adAccount.metrics.length) {
    //   //     this.initializeGraphs();
    //   //   }
    //   // }
      
   
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes)
    if (changes['adAccounts']) {

      // console.log(changes['adAccounts'])
      this.initializeGraphs();
    }
  }


  initializeGraphs() {
    setTimeout(() => {
      
      // if (!this.metrics().length) return

      const adAccounts = this.adAccounts;
      // const adAccounts = this.adAccounts();

      this.adAccountsGraphs.set([]);

      for (let adAccount of adAccounts) {
        const metrics = adAccount.metrics.filter(m => m.enabled) || [];
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


    for (const adAccount of this.adAccountsGraphs()) {
      for (const config of adAccount.graphs) {
        const canvases = document.querySelectorAll(`#Chart${config.metric}`);
        
        if (!canvases.length) continue;
  
        let currentCanvas = canvases[canvases.length - 1];
        let canvasId = `Chart${config.metric}-${canvases.length}`
        currentCanvas.id = canvasId;
  
        let data = this.graphs().map(g => parseFloat(g[config.metric]) || Math.random() * 1000);
        
        // console.log(data)

        // if (data.every(d => d === 0)) {
        //   data.forEach((d, index) => {
        //     d = Math.random() * 1000;
        //   });
        // };

        // console.log(data)
  
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


  // getChartConfiguration(config: GraphConfig, labels: string[], data: number[]) {
  //   return 
  // }

  // reorderItems(event: Sortable.SortableEvent) {
    
  //   const movedItem = this.displayedGraphs.splice(event.oldIndex!, 1)[0];
  //   this.displayedGraphs.splice(event.newIndex!, 0, movedItem);
  //   this.displayedGraphs.forEach((m: any, index: number) => m.order = index);

  //   for (let [index, metric] of this.metrics().entries()) {
      
  //     const order = this.displayedGraphs.findIndex((g: any) => g.name === metric.name);
  //     if (order !== -1) {
  //       metric.order = order;
  //     }
  //     else {
  //       metric.order = this.displayedGraphs.length + index; 
  //     }
  //   }

  //   this.metrics.set(this.metrics().sort((a, b) => a.order - b.order));
  // }

}
