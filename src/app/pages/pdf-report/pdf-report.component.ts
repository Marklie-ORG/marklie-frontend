import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { BestAd, Campaign, Graph, Kpis, ReportService } from '../../services/api/report.service';
import { ActivatedRoute } from '@angular/router';

import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-pdf-report',
  templateUrl: './pdf-report.component.html',
  styleUrl: './pdf-report.component.scss'
})
export class PdfReportComponent {
  KPIs!: Kpis;

  graphs: Graph[] = [];

  campaigns: Campaign[] = [];

  bestAds: BestAd[] = [];

  reportStatsLoading = false;

  constructor(
    private reportService: ReportService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {

    const reportId = this.route.snapshot.params['id'];

    if (reportId) {
      this.updateReportStats(reportId);
    }
  }

  async updateReportStats(reportId: string) {
    this.reportStatsLoading = true; 
    const start = performance.now();
    ({ KPIs: this.KPIs, graphs: this.graphs, campaigns: this.campaigns, bestAds: this.bestAds } = await this.reportService.getWeeklyReportById(reportId));
    const end = performance.now();
    console.log(`getReportStats execution time: ${end - start}ms`);
    this.reportStatsLoading = false;
    this.ref.detectChanges();
    setTimeout(() => {
      this.initializeCharts();
    });
  }
  

  private initializeCharts() {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    };

    const dates = this.graphs.map(g => g.date);
    const formattedDates = dates.map(formatDate);

    Chart.register(ChartDataLabels); // Register the plugin globally
    
    new Chart('spendChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Daily Spend',
          data: this.graphs.map(g => parseFloat(g.spend)),
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3498db',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#3498db',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Daily Ad Spend',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: 20
          },
          legend: {
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#3498db',
            borderWidth: 1.5,
            padding: 15,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `$${context.parsed.y.toFixed(2)}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            anchor: 'end', // Position the label at the end of the point
            align: 'bottom',  // Align the label to the top of the point
            offset: 8,     // Add some offset for better spacing
            font: {
              size: 10,
              // weight: 'bold'
            },
            color: '#333', // Label text color
            formatter: function(value, context) { // Format the label value
              return '$' + value.toFixed(0); // Display with dollar sign and 2 decimal places
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              },
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        },
      }
    });

    // Spend Chart
    

    // ROAS Chart
    new Chart('roasChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'ROAS',
          data: this.graphs.map(g => parseFloat(g.purchaseRoas)),
          borderColor: '#2ecc71'
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Return on Ad Spend'
          }
        }
      }
    });

    // Conversion Chart
    new Chart('conversionChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Purchases',
          data: this.graphs.map(g => parseInt(g.purchases)),
          borderColor: '#e74c3c'
        }, {
          label: 'Add to Cart', 
          data: this.graphs.map(g => parseInt(g.addToCart)),
          borderColor: '#f1c40f'
        }, {
          label: 'Checkouts',
          data: this.graphs.map(g => parseInt(g.initiatedCheckouts)),
          borderColor: '#9b59b6'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Conversion Metrics'
          }
        }
      }
    });

    // Engagement Chart
    new Chart('engagementChart', {
      type: 'line', 
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Clicks',
          data: this.graphs.map(g => parseInt(g.clicks)),
          borderColor: '#e67e22'
        }, {
          label: 'Impressions',
          data: this.graphs.map(g => parseInt(g.impressions)),
          borderColor: '#1abc9c'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Engagement Metrics'
          }
        }
      }
    });

    // CTR Chart
    new Chart('ctrChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Click-Through Rate',
          data: this.graphs.map(g => parseFloat(g.ctr)),
          borderColor: '#34495e'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Click-Through Rate'
          }
        }
      }
    });

    // CPC Chart
    new Chart('cpcChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Cost Per Click',
          data: this.graphs.map(g => parseFloat(g.cpc)),
          borderColor: '#16a085'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Cost Per Click'
          }
        }
      }
    });

    // Cost Per Purchase Chart
    new Chart('costPerPurchaseChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Cost Per Purchase',
          data: this.graphs.map(g => parseFloat(g.costPerPurchase)),
          borderColor: '#8e44ad'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Cost Per Purchase'
          }
        }
      }
    });

    // Conversion Value Chart
    new Chart('conversionValueChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Conversion Value',
          data: this.graphs.map(g => parseFloat(g.conversionValue)),
          borderColor: '#c0392b'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Conversion Value'
          }
        }
      }
    });

    // Cost Per Add to Cart Chart
    new Chart('costPerCartChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Cost Per Add to Cart',
          data: this.graphs.map(g => parseFloat(g.costPerAddToCart)),
          borderColor: '#d35400'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Cost Per Add to Cart'
          }
        }
      }
    });

    // Initiated Checkouts Chart
    new Chart('checkoutsChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Initiated Checkouts',
          data: this.graphs.map(g => parseInt(g.initiatedCheckouts)),
          borderColor: '#27ae60'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Initiated Checkouts'
          }
        }
      }
    });
  }
}
