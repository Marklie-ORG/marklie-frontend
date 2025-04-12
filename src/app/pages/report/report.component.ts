import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { BestAd, Campaign, Graph, Kpis, ReportService } from '../../services/api/report.service';
import { ActivatedRoute } from '@angular/router';

import ChartDataLabels from 'chartjs-plugin-datalabels';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit {
  KPIs!: Kpis;

  graphs: Graph[] = [];

  campaigns: Campaign[] = [];

  bestAds: BestAd[] = [];

  reportStatsLoading = false;

  datePresets = [
    { value: 'today', text: 'Today' },
    { value: 'yesterday', text: 'Yesterday' },
    { value: 'this_month', text: 'This Month' },
    { value: 'last_month', text: 'Last Month' },
    { value: 'this_quarter', text: 'This Quarter' },
    { value: 'maximum', text: 'Maximum' },
    { value: 'data_maximum', text: 'Data Maximum' },
    { value: 'last_3d', text: 'Last 3 Days' },
    { value: 'last_7d', text: 'Last 7 Days' },
    { value: 'last_14d', text: 'Last 14 Days' },
    { value: 'last_28d', text: 'Last 28 Days' },
    { value: 'last_30d', text: 'Last 30 Days' },
    { value: 'last_90d', text: 'Last 90 Days' },
    { value: 'last_week_mon_sun', text: 'Last Week (Mon-Sun)' },
    { value: 'last_week_sun_sat', text: 'Last Week (Sun-Sat)' },
    { value: 'last_quarter', text: 'Last Quarter' },
    { value: 'last_year', text: 'Last Year' },
    { value: 'this_week_mon_today', text: 'This Week (Mon-Today)' },
    { value: 'this_week_sun_today', text: 'This Week (Sun-Today)' },
    { value: 'this_year', text: 'This Year' }
  ];

  selectedDatePreset = "last_7d";
  selectedDatePresetText = "Last 7 Days";

  constructor(
    private reportService: ReportService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnChanges() {
    // Update selectedDatePresetText when selectedDatePreset changes
    const preset = this.datePresets.find(p => p.value === this.selectedDatePreset);
    if (preset) {
      this.selectedDatePresetText = preset.text;
    }
  }

  async ngOnInit() {

    const reportId = this.route.snapshot.params['id'];

    if (reportId) {
      this.updateReportStats(reportId);
    }

    try {
      // const reportStats = await this.reportService.getReportStats();
      const reportStats = {
        "bestAds": [
            {
                "adCreativeId": "2189365538147179",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/482422647_1286213389104987_4095784446547550610_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=1-7&_nc_sid=18de74&_nc_ohc=gYmDbxzXrLcQ7kNvgFJLOEJ&_nc_oc=AdgdQsvKvsH7pS2ewRNoaUx60Dqci_EPOOEnpAHJkcGgRNroqMgx3lz15P1wsKCbw8oZnk-1AlxrbRkpt-Hd9aIP&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYEiLe93lVwiPxi61JtcHA3ZAf4sJ73MCGQBtTo0L-DJoQ&oe=67D9BF7D",
                "spend": "12.34",
                "addToCart": "7",
                "purchases": "2",
                "roas": "45.123456",
                "sourceUrl": "https://www.instagram.com/p/DGnpldFgcBw/"
            },
            {
                "adCreativeId": "654372043937341",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.66404-15/482211611_530461443431732_2756211085979181376_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ccb=1-7&_nc_sid=18de74&_nc_ohc=tmITJixd0E8Q7kNvgGpaX0r&_nc_oc=Adgk726hzLYNSuw3byn2aVgeP6Wjjc6F5secO_s9CGJSPUbAfEBTDJ2pCxHiqTu65vISo27yEumKZr5JUI8IBFlK&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&_nc_gid=A1kLxphdiIHZOjKr7-CFy_x&oh=00_AYGy2MkSVMrrMMMOjmI7OO_LZb1xzCgFJmB_zQJOI1h3hA&oe=67D9B524",
                "spend": "15.67",
                "addToCart": "11",
                "purchases": "3",
                "roas": "40.987654",
                "sourceUrl": "https://www.instagram.com/p/DG5fUbpAGWC/"
            },
            {
                "adCreativeId": "987607223315046",
                "thumbnailUrl": "https://scontent-ams4-1.cdninstagram.com/v/t51.2885-15/481468300_644631508508263_7228676733588715195_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=1-7&_nc_sid=18de74&_nc_ohc=WabBYJ1kRpIQ7kNvgGHFPZZ&_nc_oc=AdjxEzpA5kd__ank3MzEiI5-6OqmKJ6Bc09NPC6lpvXyG8NiJr99cc4flhAyl8umeB0zokFrUvpcrBbo3EcOAEs2&_nc_zt=23&_nc_ht=scontent-ams4-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYHpjpSo--bMzSzMn7ua6XkXsXpz_stoGjaLSE3dyhdzFw&oe=67D9B6E8",
                "spend": "22.45",
                "addToCart": "5",
                "purchases": "2",
                "roas": "30.123789",
                "sourceUrl": "https://www.instagram.com/p/DGirKkMgZfF/"
            },
            {
                "adCreativeId": "609975474954490",
                "thumbnailUrl": "https://scontent-ams4-1.cdninstagram.com/v/t51.66404-15/482904381_1671022223792546_9080717342090812706_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=1-7&_nc_sid=18de74&_nc_ohc=CkA6QSSjyzMQ7kNvgHVSCfp&_nc_oc=AdgnSX9zOF5qSjMIz4AkeRF2LCg417dPzKcJLesaXUjngAW2dVnLWttlcg4VDfLGGgbNWeGOH0d5Rq1ZoRFeCjii&_nc_zt=23&_nc_ht=scontent-ams4-1.cdninstagram.com&edm=AEQ6tj4EAAAA&_nc_gid=ALyD0ai4lqmnKesqvzvx8I-&oh=00_AYH_Z61Z84ucJAF-RbfeDkxpiL9Up0t-eIPEbAn5bKYFKg&oe=67D9BE4F",
                "spend": "75.89",
                "addToCart": "14",
                "purchases": "4",
                "roas": "20.567890",
                "sourceUrl": "https://www.instagram.com/p/DGdxqbWg906/"
            },
            {
                "adCreativeId": "659575426585589",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.66404-15/477019737_651436607534405_2724756208619632648_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=1-7&_nc_sid=18de74&_nc_ohc=Fl73vJnL0I8Q7kNvgG3nVHG&_nc_oc=AdjaAG2aCkCgG-oVkNnv8wWLT6PslmJc6E-X4N5oBci-6gT5lpHgDORaM01VyUSk5DTUg-khl5rXT2Yj_1vartvv&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&_nc_gid=KDh8ZCOs-9EkJwMRYDIAKQ&oh=00_AYHPGj8K_9F1mjMbE9yENj_VbIBYA-rxdgSErhz781imDQ&oe=67D9A1C3",
                "spend": "32.10",
                "addToCart": "3",
                "purchases": "3",
                "roas": "20.987654",
                "sourceUrl": "https://www.instagram.com/p/DGV0sEggdG5/"
            },
            {
                "adCreativeId": "1546570426015714",
                "thumbnailUrl": "https://scontent-ams4-1.cdninstagram.com/v/t51.2885-15/482798202_1630912474203681_9065245098768009247_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=1-7&_nc_sid=18de74&_nc_ohc=_4nx8ULrR9wQ7kNvgFfv-hY&_nc_oc=Adje9gDjEQHvdnrH8RGm20wWGVj_PraxWvuKSY2FPlu44-op6p4JVJt9E2KWQyygf_9MEvs9RCvB0m7YHxdRg5M6&_nc_zt=23&_nc_ht=scontent-ams4-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYF8JgdYqtWnfJWCfP4oAdiT26v8I4MMAp3AYfgINnAz3w&oe=67D98EFF",
                "spend": "30.12",
                "addToCart": "2",
                "purchases": "2",
                "roas": "18.123456",
                "sourceUrl": "https://www.instagram.com/p/DG5fT79gNdu/"
            },
            {
                "adCreativeId": "612668914819561",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/475600282_1411256569838872_640798531603928819_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ccb=1-7&_nc_sid=18de74&_nc_ohc=FqQmwzXJiCAQ7kNvgF8dCYt&_nc_oc=AdgcIlVUs8H9xHk96WSox1poVb_-eWzmAv1nQA7LoXe5GihqOQ1TzU5Zc_BJTt2il_DQhTLMAbnXp1aXIrQ_ij2F&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYEAhelYG-2XMBm2OIkgVJMzX16ZRdiLXYoLkTCGIICnqw&oe=67D9B14E",
                "spend": "50.78",
                "addToCart": "5",
                "purchases": "2",
                "roas": "12.345678",
                "sourceUrl": "https://www.instagram.com/p/DGirKsCgaH1/"
            },
            {
                "adCreativeId": "1005116964833096",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/483756951_657081693472066_4968697456504998694_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=1-7&_nc_sid=18de74&_nc_ohc=Gx1WgVf9mqEQ7kNvgFtZ6AJ&_nc_oc=Adjsq_p5hD7EOqKF4H0psnXwmZFoKeAuH3U7Pu8JYH6NvePOR0HQPjH2ICp8NOxxXtX0EMbxgg0bLke_6QPL6f72&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYHAPgeKCveCAhkElF2i243lE9t90X0zVbzS9-FRO1ssSw&oe=67D9B5A6",
                "spend": "90.12",
                "addToCart": "10",
                "purchases": "4",
                "roas": "11.987654",
                "sourceUrl": "https://www.instagram.com/p/DG5fVutA4kK/"
            },
            {
                "adCreativeId": "988259656702550",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/482372174_654982767186127_606361572605316567_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ccb=1-7&_nc_sid=18de74&_nc_ohc=8wl2TQrhWBUQ7kNvgGuacic&_nc_oc=AdixtLenWD-tzB3ux8yuMuZvJPUX44_55tioJjAPOxrZAavdV9h8M8Jpk6cdNMmAoMGOMmea0ggQCzk2GtNEk4iY&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYFOJ0f-I5DnU_DNKNZ1TJRcDLEkmJllToz_g6z-N7Mq4A&oe=67D9BC01",
                "spend": "35.67",
                "addToCart": "8",
                "purchases": "2",
                "roas": "11.123456",
                "sourceUrl": "https://www.instagram.com/p/DGvbxITA0dF/"
            },
            {
                "adCreativeId": "2011722892666920",
                "thumbnailUrl": "https://scontent-ams4-1.cdninstagram.com/v/t51.2885-15/482769799_2974537682722736_8739707751552030285_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=1-7&_nc_sid=18de74&_nc_ohc=RvuI9jsZ0vwQ7kNvgGfylGu&_nc_oc=AditqMerEWIYjt-5CtO4cixAnJxIypApsfor7SpEL2ru_oEBc69KiXOjslSlgqmiYY3peOm5tX9ey8mjxYdsj7hN&_nc_zt=23&_nc_ht=scontent-ams4-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYFjQdKFyspOizIjFCwp9sxfaqkVQjcFS4eZ5uluO8VK7Q&oe=67D9BEFC",
                "spend": "28.90",
                "addToCart": "5",
                "purchases": "2",
                "roas": "10.987654",
                "sourceUrl": "https://www.instagram.com/p/DGvbxKogGkd/"
            }
        ],
        "KPIs": {
            "accountName": "Airback ALL",
            "accountId": "1083076062681667",
            "spend": "25000.00",
            "impressions": "3500000",
            "clicks": "85000",
            "cpc": "0.29412",
            "ctr": "2.428571",
            "purchases": "200",
            "costPerPurchase": "125.00",
            "conversionValue": "50000.00",
            "addToCart": "1500",
            "costPerAddToCart": "16.666667",
            "initiatedCheckouts": "800",
            "purchaseRoas": "2.000000"
        },
        "campaigns": [
            {
                "campaignName": "campaign 1",
                "spend": "6000.00",
                "purchases": "40",
                "conversionRate": "0.35",
                "purchaseRoas": "2.000000"
            },
            {
                "campaignName": "campaign 2",
                "spend": "3000.00",
                "purchases": "30",
                "conversionRate": "0.35",
                "purchaseRoas": "2.500000"
            },
            {
                "campaignName": "campaign 3",
                "spend": "2800.00",
                "purchases": "20",
                "conversionRate": "0.30",
                "purchaseRoas": "2.000000"
            },
            {
                "campaignName": "campaign 4",
                "spend": "2300.00",
                "purchases": "20",
                "conversionRate": "0.40",
                "purchaseRoas": "2.500000"
            },
            {
                "campaignName": "campaign 5",
                "spend": "1500.00",
                "purchases": "10",
                "conversionRate": "0.30",
                "purchaseRoas": "1.500000"
            },
            {
                "campaignName": "campaign 6",
                "spend": "1400.00",
                "purchases": "15",
                "conversionRate": "0.35",
                "purchaseRoas": "2.500000"
            },
            {
                "campaignName": "campaign 7",
                "spend": "1200.00",
                "purchases": "10",
                "conversionRate": "0.15",
                "purchaseRoas": "2.000000"
            },
            {
                "campaignName": "campaign 8",
                "spend": "1150.00",
                "purchases": "8",
                "conversionRate": "0.45",
                "purchaseRoas": "1.000000"
            },
            {
                "campaignName": "campaign 9",
                "spend": "1000.00",
                "purchases": "12",
                "conversionRate": "0.30",
                "purchaseRoas": "3.000000"
            },
            {
                "campaignName": "campaign 10",
                "spend": "900.00",
                "purchases": "5",
                "conversionRate": "0.05",
                "purchaseRoas": "1.000000"
            },
            {
                "campaignName": "campaign 11",
                "spend": "800.00",
                "purchases": "3",
                "conversionRate": "0.15",
                "purchaseRoas": "0.800000"
            },
            {
                "campaignName": "campaign 12",
                "spend": "750.00",
                "purchases": "4",
                "conversionRate": "0.30",
                "purchaseRoas": "1.000000"
            },
            {
                "campaignName": "campaign 13",
                "spend": "600.00",
                "purchases": "3",
                "conversionRate": "0.10",
                "purchaseRoas": "1.000000"
            },
            {
                "campaignName": "campaign 14",
                "spend": "450.00",
                "purchases": "5",
                "conversionRate": "0.20",
                "purchaseRoas": "5.000000"
            },
            {
                "campaignName": "campaign 15",
                "spend": "400.00",
                "purchases": "4",
                "conversionRate": "0.35",
                "purchaseRoas": "1.500000"
            },
            {
                "campaignName": "campaign 16",
                "spend": "350.00",
                "purchases": "4",
                "conversionRate": "1.20",
                "purchaseRoas": "4.500000"
            },
            {
                "campaignName": "campaign 17",
                "spend": "150.00",
                "purchases": "1",
                "conversionRate": "0.10",
                "purchaseRoas": "0.500000"
            },
            {
                "campaignName": "campaign 18",
                "spend": "50.00",
                "purchases": "0",
                "conversionRate": "0.00",
                "purchaseRoas": "0"
            },
            {
                "campaignName": "campaign 19",
                "spend": "0",
                "purchases": "0",
                "conversionRate": "NaN",
                "purchaseRoas": "0"
            }
        ],
        "graphs": [
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3500.00",
                "impressions": "500000",
                "clicks": "18000",
                "cpc": "0.19444",
                "ctr": "3.600000",
                "purchases": "25",
                "costPerPurchase": "140.00",
                "conversionValue": "6000.00",
                "addToCart": "250",
                "costPerAddToCart": "14.000000",
                "initiatedCheckouts": "150",
                "purchaseRoas": "1.714286",
                "date": "2025-03-07T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3600.00",
                "impressions": "450000",
                "clicks": "13000",
                "cpc": "0.27692",
                "ctr": "2.888889",
                "purchases": "26",
                "costPerPurchase": "138.46",
                "conversionValue": "7000.00",
                "addToCart": "230",
                "costPerAddToCart": "15.652174",
                "initiatedCheckouts": "140",
                "purchaseRoas": "1.944444",
                "date": "2025-03-08T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "4200.00",
                "impressions": "500000",
                "clicks": "13000",
                "cpc": "0.32308",
                "ctr": "2.600000",
                "purchases": "40",
                "costPerPurchase": "105.00",
                "conversionValue": "11000.00",
                "addToCart": "270",
                "costPerAddToCart": "15.555556",
                "initiatedCheckouts": "150",
                "purchaseRoas": "2.619048",
                "date": "2025-03-09T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3900.00",
                "impressions": "550000",
                "clicks": "13000",
                "cpc": "0.30000",
                "ctr": "2.363636",
                "purchases": "26",
                "costPerPurchase": "150.00",
                "conversionValue": "7000.00",
                "addToCart": "240",
                "costPerAddToCart": "16.250000",
                "initiatedCheckouts": "120",
                "purchaseRoas": "1.794872",
                "date": "2025-03-10T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3700.00",
                "impressions": "500000",
                "clicks": "10000",
                "cpc": "0.37000",
                "ctr": "2.000000",
                "purchases": "26",
                "costPerPurchase": "142.31",
                "conversionValue": "7500.00",
                "addToCart": "240",
                "costPerAddToCart": "15.416667",
                "initiatedCheckouts": "120",
                "purchaseRoas": "2.027027",
                "date": "2025-03-11T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3900.00",
                "impressions": "550000",
                "clicks": "12000",
                "cpc": "0.32500",
                "ctr": "2.181818",
                "purchases": "20",
                "costPerPurchase": "195.00",
                "conversionValue": "4500.00",
                "addToCart": "180",
                "costPerAddToCart": "21.666667",
                "initiatedCheckouts": "110",
                "purchaseRoas": "1.153846",
                "date": "2025-03-12T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3300.00",
                "impressions": "400000",
                "clicks": "10000",
                "cpc": "0.33000",
                "ctr": "2.500000",
                "purchases": "15",
                "costPerPurchase": "220.00",
                "conversionValue": "4000.00",
                "addToCart": "200",
                "costPerAddToCart": "16.500000",
                "initiatedCheckouts": "100",
                "purchaseRoas": "1.212121",
                "date": "2025-03-13T00:00:00.000Z"
            }
        ]
    };
      // Update component data with reportStats
      this.KPIs = reportStats.KPIs;
      this.graphs = reportStats.graphs;
      this.campaigns = reportStats.campaigns;
      this.bestAds = reportStats.bestAds;
      
      setTimeout(() => {
        this.initializeCharts();
      });
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  }

  async updateReportStats(reportId?: string) {
    this.reportStatsLoading = true; 
    const start = performance.now();
    if (reportId) {
      ({ KPIs: this.KPIs, graphs: this.graphs, campaigns: this.campaigns, bestAds: this.bestAds } = await this.reportService.getWeeklyReportById(reportId));
    }
    else {
      ({ KPIs: this.KPIs, graphs: this.graphs, campaigns: this.campaigns, bestAds: this.bestAds } = await this.reportService.getReportStats(this.selectedDatePreset));
    }
    const end = performance.now();
    console.log(`getReportStats execution time: ${end - start}ms`);
    this.reportStatsLoading = false;
    this.ref.detectChanges();
    setTimeout(() => {
      this.initializeCharts();
    });
  }

  startDate: string = '';
  endDate: string = '';

  onDateChange(event: string, type: 'start' | 'end') {
    if (type === 'start') {
      this.startDate = event;
    } else {
      this.endDate = event;
    }

    console.log(this.startDate, this.endDate);

    // Only update if both dates are set
    if (this.startDate && this.endDate) {
      // Validate date range
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      
      if (start > end) {
        // Handle invalid date range
        if (type === 'start') {
          this.startDate = this.endDate;
        } else {
          this.endDate = this.startDate;
        }
        return;
      }

      // Update report with new date range
      // this.updateReportStats();
    }
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

    
    // this.initializeSpendChart(
    //   'spendChart', 
    //   'Daily Spend', 
    //   'Daily Ad Spend', 
    //   this.graphs.map(g => parseFloat(g.spend)), 
    //   formattedDates,
    //   'rgba(52, 152, 219, 1)'
    // );
    
    new Chart('spendChart', {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Daily Spend',
          data: this.graphs.map(g => parseFloat(g.spend)),
          borderColor: '#ad96f2',
          // backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#ad96f2',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#ad96f2',
          pointHoverBorderColor: '#ad96f2',
          pointHoverBorderWidth: 2,
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
              weight: 'bold',
              family: "'Inter Variable', sans-serif"
            },
            padding: 20
          },
          legend: {
            display: false,
            labels: {
              font: {
                size: 12,
                family: "'Inter Variable', sans-serif"
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#ad96f2',
            borderWidth: 1.5,
            cornerRadius: 8,
            padding: 15,
            displayColors: false,
            titleFont: {
              family: "'Inter Variable', sans-serif"
            },
            bodyFont: {
              family: "'Inter Variable', sans-serif"
            },
            callbacks: {
              label: function(context) {
                return `$ ${context.parsed.y.toFixed(2)}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: false,
            anchor: 'end', // Position the label at the end of the point
            align: 'bottom',  // Align the label to the top of the point
            offset: 8,     // Add some offset for better spacing
            font: {
              size: 10,
              family: "'Inter Variable', sans-serif"
              // weight: 'bold'
            },
            color: '#333', // Label text color
            formatter: function(value, context) { // Format the label value
              return '$ ' + value.toFixed(0); // Display with dollar sign and 2 decimal places
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.03)',
            },
            ticks: {
              font: {
                size: 11,
                family: "'Inter Variable', sans-serif"
              }
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.03)'
            },
            ticks: {
              count: 4,
              font: {
                size: 11,
                family: "'Inter Variable', sans-serif"
              },
              callback: function(value) {
                return '$ ' + Number(value).toFixed(0);
              }
            },
            afterDataLimits: (scale) => {
              const range = scale.max - scale.min;
              scale.max += range * 0.2;
              scale.min -= range * 0.4;
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
