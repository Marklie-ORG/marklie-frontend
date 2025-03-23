import { ChangeDetectorRef, Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { BestAd, Campaign, Graph, Kpis, ReportService } from '../../services/report.service';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';

import ChartDataLabels from 'chartjs-plugin-datalabels';

interface KpiItem {
  id: string;
  label: string;
  isVisible: boolean;
  valueClass?: string;
  getValue: (kpis: any) => string;
}

@Component({
  selector: 'app-edit-report',
  templateUrl: './edit-report.component.html',
  styleUrls: ['./edit-report.component.scss']
})
export class EditReportComponent implements OnInit, OnDestroy {
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  @ViewChild('kpiDropdownContainer') kpiDropdownContainer!: ElementRef;

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

  htmlGraphs: {id: string, title: string, isVisible: boolean}[] = [
    {id: 'spendChart', title: 'Daily Spend', isVisible: true},
    {id: 'roasChart', title: 'ROAS', isVisible: true},
    {id: 'conversionChart', title: 'Conversion Rate', isVisible: true},
    {id: 'engagementChart', title: 'Engagement Rate', isVisible: true},
    {id: 'ctrChart', title: 'CTR', isVisible: true},
    {id: 'cpcChart', title: 'CPC', isVisible: true},
    {id: 'costPerPurchaseChart', title: 'Cost Per Purchase', isVisible: true},
    {id: 'conversionValueChart', title: 'Conversion Value', isVisible: true},
    {id: 'costPerCartChart', title: 'Cost Per Cart', isVisible: true},
    {id: 'checkoutsChart', title: 'Checkouts', isVisible: true},
  ];

  utilGtmlGraphs = this.htmlGraphs;

  selectedDatePreset = "last_7d";
  selectedDatePresetText = "Last 7 Days";

  isDropdownOpen = false;
  isKpiDropdownOpen = false;

  headerBackgroundColor: string = '#ffffff';
  dashboardBackgroundColor: string = '#f8f9fa';

  kpiItems: KpiItem[] = [
    {
      id: 'spend',
      label: 'Total Spend',
      isVisible: true,
      valueClass: 'primary',
      getValue: (kpis) => `$${this.formatNumber(kpis?.spend, '1.2-2')}`
    },
    {
      id: 'roas',
      label: 'ROAS',
      isVisible: true,
      valueClass: 'success',
      getValue: (kpis) => `${this.formatNumber(kpis?.purchaseRoas, '1.2-2')}x`
    },
    {
      id: 'conversionValue',
      label: 'Conversion Value',
      isVisible: true,
      valueClass: 'success',
      getValue: (kpis) => `$${this.formatNumber(kpis?.conversionValue, '1.2-2')}`
    },
    {
      id: 'purchases',
      label: 'Purchases',
      isVisible: true,
      valueClass: 'success',
      getValue: (kpis) => `${kpis?.purchases}`
    },
    {
      id: 'impressions',
      label: 'Impressions',
      isVisible: true,
      getValue: (kpis) => this.formatNumber(kpis?.impressions, '1.0-0')
    },
    {
      id: 'clicks',
      label: 'Clicks',
      isVisible: true,
      getValue: (kpis) => this.formatNumber(kpis?.clicks, '1.0-0')
    },
    {
      id: 'cpc',
      label: 'CPC',
      isVisible: true,
      getValue: (kpis) => `$${this.formatNumber(kpis?.cpc, '1.2-2')}`
    },
    {
      id: 'ctr',
      label: 'CTR',
      isVisible: true,
      getValue: (kpis) => `${this.formatNumber(kpis?.ctr, '1.2-2')}%`
    },
    {
      id: 'costPerPurchase',
      label: 'Cost Per Purchase',
      isVisible: true,
      getValue: (kpis) => `$${this.formatNumber(kpis?.costPerPurchase, '1.2-2')}`
    },
    {
      id: 'addToCart',
      label: 'Add To Cart',
      isVisible: true,
      getValue: (kpis) => this.formatNumber(kpis?.addToCart, '1.0-0')
    },
    {
      id: 'costPerAddToCart',
      label: 'Cost Per Add To Cart',
      isVisible: true,
      getValue: (kpis) => `$${this.formatNumber(kpis?.costPerAddToCart, '1.2-2')}`
    },
    {
      id: 'initiatedCheckouts',
      label: 'Initiated Checkouts',
      isVisible: true,
      getValue: (kpis) => this.formatNumber(kpis?.initiatedCheckouts, '1.0-0')
    }
  ];

  constructor(
    private reportService: ReportService,
    private ref: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.loadKpiSettings();
  }

  ngOnChanges() {
    // Update selectedDatePresetText when selectedDatePreset changes
    const preset = this.datePresets.find(p => p.value === this.selectedDatePreset);
    if (preset) {
      this.selectedDatePresetText = preset.text;
    }
  }

  async ngOnInit() {

    // const reportId = this.route.snapshot.params['id'];

    // if (reportId) {
    //   this.updateReportStats(reportId);
    // }

    try {
      // const reportStats = await this.reportService.getReportStats();
      const reportStats = {
        "bestAds": [
            {
                "adCreativeId": "2189365538147179",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/482422647_1286213389104987_4095784446547550610_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=1-7&_nc_sid=18de74&_nc_ohc=gYmDbxzXrLcQ7kNvgFJLOEJ&_nc_oc=AdgdQsvKvsH7pS2ewRNoaUx60Dqci_EPOOEnpAHJkcGgRNroqMgx3lz15P1wsKCbw8oZnk-1AlxrbRkpt-Hd9aIP&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYEiLe93lVwiPxi61JtcHA3ZAf4sJ73MCGQBtTo0L-DJoQ&oe=67D9BF7D",
                "spend": "156.34",
                "addToCart": "12",
                "purchases": "4", 
                "roas": "3.82",
                "sourceUrl": "https://www.instagram.com/p/DGnpldFgcBw/"
            },
            {
                "adCreativeId": "654372043937341",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.66404-15/482211611_530461443431732_2756211085979181376_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ccb=1-7&_nc_sid=18de74&_nc_ohc=tmITJixd0E8Q7kNvgGpaX0r&_nc_oc=Adgk726hzLYNSuw3byn2aVgeP6Wjjc6F5secO_s9CGJSPUbAfEBTDJ2pCxHiqTu65vISo27yEumKZr5JUI8IBFlK&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&_nc_gid=A1kLxphdiIHZOjKr7-CFy_x&oh=00_AYGy2MkSVMrrMMMOjmI7OO_LZb1xzCgFJmB_zQJOI1h3hA&oe=67D9B524",
                "spend": "245.67",
                "addToCart": "18",
                "purchases": "5",
                "roas": "3.45",
                "sourceUrl": "https://www.instagram.com/p/DG5fUbpAGWC/"
            },
            {
                "adCreativeId": "987607223315046", 
                "thumbnailUrl": "https://scontent-ams4-1.cdninstagram.com/v/t51.2885-15/481468300_644631508508263_7228676733588715195_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=1-7&_nc_sid=18de74&_nc_ohc=WabBYJ1kRpIQ7kNvgGHFPZZ&_nc_oc=AdjxEzpA5kd__ank3MzEiI5-6OqmKJ6Bc09NPC6lpvXyG8NiJr99cc4flhAyl8umeB0zokFrUvpcrBbo3EcOAEs2&_nc_zt=23&_nc_ht=scontent-ams4-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYHpjpSo--bMzSzMn7ua6XkXsXpz_stoGjaLSE3dyhdzFw&oe=67D9B6E8",
                "spend": "322.45",
                "addToCart": "25", 
                "purchases": "6",
                "roas": "2.98",
                "sourceUrl": "https://www.instagram.com/p/DGirKkMgZfF/"
            },
            {
                "adCreativeId": "609975474954490",
                "thumbnailUrl": "https://scontent-ams4-1.cdninstagram.com/v/t51.66404-15/482904381_1671022223792546_9080717342090812706_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ccb=1-7&_nc_sid=18de74&_nc_ohc=CkA6QSSjyzMQ7kNvgHVSCfp&_nc_oc=AdgnSX9zOF5qSjMIz4AkeRF2LCg417dPzKcJLesaXUjngAW2dVnLWttlcg4VDfLGGgbNWeGOH0d5Rq1ZoRFeCjii&_nc_zt=23&_nc_ht=scontent-ams4-1.cdninstagram.com&edm=AEQ6tj4EAAAA&_nc_gid=ALyD0ai4lqmnKesqvzvx8I-&oh=00_AYH_Z61Z84ucJAF-RbfeDkxpiL9Up0t-eIPEbAn5bKYFKg&oe=67D9BE4F",
                "spend": "475.89",
                "addToCart": "35",
                "purchases": "8",
                "roas": "2.67",
                "sourceUrl": "https://www.instagram.com/p/DGdxqbWg906/"
            },
            {
                "adCreativeId": "659575426585589",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.66404-15/477019737_651436607534405_2724756208619632648_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=111&ccb=1-7&_nc_sid=18de74&_nc_ohc=Fl73vJnL0I8Q7kNvgG3nVHG&_nc_oc=AdjaAG2aCkCgG-oVkNnv8wWLT6PslmJc6E-X4N5oBci-6gT5lpHgDORaM01VyUSk5DTUg-khl5rXT2Yj_1vartvv&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&_nc_gid=KDh8ZCOs-9EkJwMRYDIAKQ&oh=00_AYHPGj8K_9F1mjMbE9yENj_VbIBYA-rxdgSErhz781imDQ&oe=67D9A1C3",
                "spend": "532.10",
                "addToCart": "42",
                "purchases": "9",
                "roas": "2.54",
                "sourceUrl": "https://www.instagram.com/p/DGV0sEggdG5/"
            },
            {
                "adCreativeId": "1546570426015714",
                "thumbnailUrl": "https://scontent-ams4-1.cdninstagram.com/v/t51.2885-15/482798202_1630912474203681_9065245098768009247_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=103&ccb=1-7&_nc_sid=18de74&_nc_ohc=_4nx8ULrR9wQ7kNvgFfv-hY&_nc_oc=AditqMerEWIYjt-5CtO4cixAnJxIypApsfor7SpEL2ru_oEBc69KiXOjslSlgqmiYY3peOm5tX9ey8mjxYdsj7hN&_nc_zt=23&_nc_ht=scontent-ams4-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYFjQdKFyspOizIjFCwp9sxfaqkVQjcFS4eZ5uluO8VK7Q&oe=67D9BEFC",
                "spend": "430.12",
                "addToCart": "32",
                "purchases": "7",
                "roas": "2.45",
                "sourceUrl": "https://www.instagram.com/p/DG5fT79gNdu/"
            },
            {
                "adCreativeId": "612668914819561",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/475600282_1411256569838872_640798531603928819_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=108&ccb=1-7&_nc_sid=18de74&_nc_ohc=FqQmwzXJiCAQ7kNvgF8dCYt&_nc_oc=AdgcIlVUs8H9xHk96WSox1poVb_-eWzmAv1nQA7LoXe5GihqOQ1TzU5Zc_BJTt2il_DQhTLMAbnXp1aXIrQ_ij2F&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYEAhelYG-2XMBm2OIkgVJMzX16ZRdiLXYoLkTCGIICnqw&oe=67D9B14E",
                "spend": "650.78",
                "addToCart": "45",
                "purchases": "10",
                "roas": "2.31",
                "sourceUrl": "https://www.instagram.com/p/DGirKsCgaH1/"
            },
            {
                "adCreativeId": "1005116964833096",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/483756951_657081693472066_4968697456504998694_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=106&ccb=1-7&_nc_sid=18de74&_nc_ohc=Gx1WgVf9mqEQ7kNvgFtZ6AJ&_nc_oc=Adjsq_p5hD7EOqKF4H0psnXwmZFoKeAuH3U7Pu8JYH6NvePOR0HQPjH2ICp8NOxxXtX0EMbxgg0bLke_6QPL6f72&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYHAPgeKCveCAhkElF2i243lE9t90X0zVbzS9-FRO1ssSw&oe=67D9B5A6",
                "spend": "790.12",
                "addToCart": "52",
                "purchases": "11",
                "roas": "2.09",
                "sourceUrl": "https://www.instagram.com/p/DG5fVutA4kK/"
            },
            {
                "adCreativeId": "988259656702550",
                "thumbnailUrl": "https://scontent-ams2-1.cdninstagram.com/v/t51.2885-15/482372174_654982767186127_606361572605316567_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=100&ccb=1-7&_nc_sid=18de74&_nc_ohc=8wl2TQrhWBUQ7kNvgGuacic&_nc_oc=AdixtLenWD-tzB3ux8yuMuZvJPUX44_55tioJjAPOxrZAavdV9h8M8Jpk6cdNMmAoMGOMmea0ggQCzk2GtNEk4iY&_nc_zt=23&_nc_ht=scontent-ams2-1.cdninstagram.com&edm=AEQ6tj4EAAAA&oh=00_AYFOJ0f-I5DnU_DNKNZ1TJRcDLEkmJllToz_g6z-N7Mq4A&oe=67D9BC01",
                "spend": "835.67",
                "addToCart": "58",
                "purchases": "12",
                "roas": "2.15",
                "sourceUrl": "https://www.instagram.com/p/DGvbxITA0dF/"
            }
        ],
        "KPIs": {
            "accountName": "Airback ALL",
            "accountId": "1083076062681667",
            "spend": "25432.12",
            "impressions": "3456789",
            "clicks": "87654",
            "cpc": "0.29",
            "ctr": "2.54",
            "purchases": "234",
            "costPerPurchase": "108.68",
            "conversionValue": "58234.56",
            "addToCart": "1678",
            "costPerAddToCart": "15.16",
            "initiatedCheckouts": "856",
            "purchaseRoas": "2.29"
        },
        "campaigns": [
            {
                "campaignName": "campaign 1",
                "spend": "6234.56",
                "purchases": "45",
                "conversionRate": "2.34",
                "purchaseRoas": "2.45"
            },
            {
                "campaignName": "campaign 2", 
                "spend": "3567.89",
                "purchases": "32",
                "conversionRate": "2.12",
                "purchaseRoas": "2.67"
            },
            {
                "campaignName": "campaign 3",
                "spend": "2876.54",
                "purchases": "24",
                "conversionRate": "1.98",
                "purchaseRoas": "2.34"
            },
            {
                "campaignName": "campaign 4",
                "spend": "2345.67",
                "purchases": "21",
                "conversionRate": "1.87",
                "purchaseRoas": "2.21"
            },
            {
                "campaignName": "campaign 5",
                "spend": "1567.89",
                "purchases": "15",
                "conversionRate": "1.76",
                "purchaseRoas": "2.12"
            },
            {
                "campaignName": "campaign 6",
                "spend": "1432.10",
                "purchases": "13",
                "conversionRate": "1.65",
                "purchaseRoas": "1.98"
            },
            {
                "campaignName": "campaign 7",
                "spend": "1234.56",
                "purchases": "11",
                "conversionRate": "1.54",
                "purchaseRoas": "1.87"
            },
            {
                "campaignName": "campaign 8",
                "spend": "1123.45",
                "purchases": "10",
                "conversionRate": "1.43",
                "purchaseRoas": "1.76"
            },
            {
                "campaignName": "campaign 9",
                "spend": "987.65",
                "purchases": "8",
                "conversionRate": "1.32",
                "purchaseRoas": "1.65"
            },
            {
                "campaignName": "campaign 10",
                "spend": "876.54",
                "purchases": "7",
                "conversionRate": "1.21",
                "purchaseRoas": "1.54"
            },
            {
                "campaignName": "campaign 11",
                "spend": "765.43",
                "purchases": "6",
                "conversionRate": "1.10",
                "purchaseRoas": "1.43"
            },
            {
                "campaignName": "campaign 12",
                "spend": "654.32",
                "purchases": "5",
                "conversionRate": "0.99",
                "purchaseRoas": "1.32"
            },
            {
                "campaignName": "campaign 13",
                "spend": "543.21",
                "purchases": "4",
                "conversionRate": "0.88",
                "purchaseRoas": "1.21"
            },
            {
                "campaignName": "campaign 14",
                "spend": "432.10",
                "purchases": "3",
                "conversionRate": "0.77",
                "purchaseRoas": "1.10"
            },
            {
                "campaignName": "campaign 15",
                "spend": "321.98",
                "purchases": "2",
                "conversionRate": "0.66",
                "purchaseRoas": "0.99"
            },
            {
                "campaignName": "campaign 16",
                "spend": "234.56",
                "purchases": "1",
                "conversionRate": "0.55",
                "purchaseRoas": "0.88"
            },
            {
                "campaignName": "campaign 17",
                "spend": "123.45",
                "purchases": "1",
                "conversionRate": "0.44",
                "purchaseRoas": "0.77"
            },
            {
                "campaignName": "campaign 18",
                "spend": "98.76",
                "purchases": "0",
                "conversionRate": "0.00",
                "purchaseRoas": "0.00"
            },
            {
                "campaignName": "campaign 19",
                "spend": "0.00",
                "purchases": "0",
                "conversionRate": "0.00",
                "purchaseRoas": "0.00"
            }
        ],
        "graphs": [
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3567.89",
                "impressions": "487654",
                "clicks": "17654",
                "cpc": "0.20",
                "ctr": "3.62",
                "purchases": "28",
                "costPerPurchase": "127.43",
                "conversionValue": "7234.56",
                "addToCart": "245",
                "costPerAddToCart": "14.56",
                "initiatedCheckouts": "156",
                "purchaseRoas": "2.03",
                "date": "2025-03-07T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3654.32",
                "impressions": "456789",
                "clicks": "13456",
                "cpc": "0.27",
                "ctr": "2.94",
                "purchases": "29",
                "costPerPurchase": "126.01",
                "conversionValue": "7654.32",
                "addToCart": "234",
                "costPerAddToCart": "15.62",
                "initiatedCheckouts": "145",
                "purchaseRoas": "2.09",
                "date": "2025-03-08T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "4234.56",
                "impressions": "512345",
                "clicks": "13789",
                "cpc": "0.31",
                "ctr": "2.69",
                "purchases": "42",
                "costPerPurchase": "100.82",
                "conversionValue": "11234.56",
                "addToCart": "278",
                "costPerAddToCart": "15.23",
                "initiatedCheckouts": "167",
                "purchaseRoas": "2.65",
                "date": "2025-03-09T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3876.54",
                "impressions": "534567",
                "clicks": "12987",
                "cpc": "0.30",
                "ctr": "2.43",
                "purchases": "31",
                "costPerPurchase": "125.05",
                "conversionValue": "7876.54",
                "addToCart": "245",
                "costPerAddToCart": "15.82",
                "initiatedCheckouts": "134",
                "purchaseRoas": "2.03",
                "date": "2025-03-10T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3765.43",
                "impressions": "498765",
                "clicks": "11234",
                "cpc": "0.34",
                "ctr": "2.25",
                "purchases": "32",
                "costPerPurchase": "117.67",
                "conversionValue": "8234.56",
                "addToCart": "256",
                "costPerAddToCart": "14.71",
                "initiatedCheckouts": "145",
                "purchaseRoas": "2.19",
                "date": "2025-03-11T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3987.65",
                "impressions": "545678",
                "clicks": "12345",
                "cpc": "0.32",
                "ctr": "2.26",
                "purchases": "35",
                "costPerPurchase": "113.93",
                "conversionValue": "8765.43",
                "addToCart": "267",
                "costPerAddToCart": "14.93",
                "initiatedCheckouts": "156",
                "purchaseRoas": "2.20",
                "date": "2025-03-12T00:00:00.000Z"
            },
            {
                "accountName": "Airback ALL",
                "accountId": "1083076062681667",
                "spend": "3345.67",
                "impressions": "423456",
                "clicks": "10987",
                "cpc": "0.30",
                "ctr": "2.59",
                "purchases": "27",
                "costPerPurchase": "123.91",
                "conversionValue": "7123.45",
                "addToCart": "234",
                "costPerAddToCart": "14.30",
                "initiatedCheckouts": "123",
                "purchaseRoas": "2.13",
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
      this.initializeColors();
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

  initiateDailySpendChart(chartId: string, formattedDates: string[]) {
    const color = '#ad96f2';


    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Daily Spend',
          data: this.graphs.map(g => parseFloat(g.spend)),
          borderColor: color,
          // backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: color,
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
            display: true,
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
  }

  initiateRoasChart(chartId: string, formattedDates: string[]) {

    const color = '#2ecc71';

    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'ROAS',
          data: this.graphs.map(g => parseFloat(g.purchaseRoas)),
          borderColor: color,
          
          // backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: color,
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Return on Ad Spend',
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
            borderColor: color,
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '' + value.toFixed(2); // Display with dollar sign and 2 decimal places
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
                return '' + Number(value).toFixed(2);
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
  }

  initiateConversionChart(chartId: string, formattedDates: string[]) {
    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Purchases',
          data: this.graphs.map(g => parseInt(g.purchases)),
          borderColor: '#e74c3c',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#e74c3c',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#e74c3c',
          pointHoverBorderColor: '#e74c3c',
          pointHoverBorderWidth: 2,
        }, {
          label: 'Add to Cart', 
          data: this.graphs.map(g => parseInt(g.addToCart)),
          borderColor: '#f1c40f',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#f1c40f',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#f1c40f',
          pointHoverBorderColor: '#f1c40f',
          pointHoverBorderWidth: 2,
        }, {
          label: 'Checkouts',
          data: this.graphs.map(g => parseInt(g.initiatedCheckouts)),
          borderColor: '#9b59b6',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#9b59b6',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#9b59b6',
          pointHoverBorderColor: '#9b59b6',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Conversion Metrics',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter Variable', sans-serif"
            },
            padding: 6
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              // padding: 5,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12,
                family: "'Inter Variable', sans-serif",
                // weight: '500'
              },
              // boxWidth: 8,
              // boxHeight: 8
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#e74c3c',
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '' + value.toFixed(0); // Display with dollar sign and 2 decimal places
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
            beginAtZero: true,
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
                return '' + Number(value).toFixed(0);
              }
            },
            afterDataLimits: (scale) => {
              const range = scale.max - scale.min;
              scale.max += range * 0;
              scale.min -= range * 0;
            }
          }
        },
      }
    });
  }

  initiateEngagementChart(chartId: string, formattedDates: string[]) {
    new Chart(chartId, {
      type: 'line', 
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Clicks',
          data: this.graphs.map(g => parseInt(g.clicks)),
          borderColor: '#e67e22',
          // backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#e67e22',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#e67e22',
          pointHoverBorderColor: '#e67e22',
          pointHoverBorderWidth: 2,
        }, {
          label: 'Impressions',
          data: this.graphs.map(g => parseInt(g.impressions)),
          borderColor: '#1abc9c',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#1abc9c',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#1abc9c',
          pointHoverBorderColor: '#1abc9c',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Engagement Metrics',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter Variable', sans-serif"
            },
            padding: 6
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              // padding: 5,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12,
                family: "'Inter Variable', sans-serif",
                // weight: '500'
              },
              // boxWidth: 8,
              // boxHeight: 8
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#e74c3c',
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              if (value <= 1000) {
                return value.toString();
              } else if (value <= 10000) {
                return Math.round(value/100)*100;
              } else if (value < 100000) {
                return (Math.round(value/100)/10).toFixed(1) + 'k';
              } else {
                return Math.round(value/1000) + 'k';
              }
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
            beginAtZero: true,
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
                const absValue = Math.abs(Number(value));
                const sign = Number(value) < 0 ? '-' : '';
                
                if (absValue <= 1000) {
                  return sign + value.toString();
                } else if (absValue <= 10000) {
                  return sign + Math.round(absValue/100)*100;
                } else if (absValue < 100000) {
                  return sign + (Math.round(absValue/100)/10).toFixed(1) + 'k';
                } else {
                  return sign + Math.round(absValue/1000) + 'k';
                }
              }
            },
            afterDataLimits: (scale) => {
              const range = scale.max - scale.min;
              scale.max += range * 0.1;
              scale.min -= range * 0.2;
            }
          }
        },
      }
    });
  }

  initiateCtrChart(chartId: string, formattedDates: string[], data: number[]) {
    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Click-Through Rate',
          data: data,
          borderColor: '#34495e',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#34495e',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#34495e',
          pointHoverBorderColor: '#34495e',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Click-Through Rate',
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
            borderColor: '#34495e',
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '' + value.toFixed(2) + '%'; // Display with dollar sign and 2 decimal places
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
                return '' + Number(value).toFixed(2) + '%';
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
  }

  initiateCpcChart(chartId: string, formattedDates: string[], data: number[]) {
    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Cost Per Click',
          data: data,
          borderColor: '#16a085',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#16a085',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#16a085',
          pointHoverBorderColor: '#16a085',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Cost Per Click',
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
            borderColor: '#8e44ad',
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '$ ' + value.toFixed(2); // Display with dollar sign and 2 decimal places
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
                return '$ ' + Number(value).toFixed(2);
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
  }

  initiateCppChart(chartId: string, formattedDates: string[], data: number[]) {
    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Cost Per Purchase',
          data: data,
          borderColor: '#8e44ad',
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: '#8e44ad',
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#8e44ad',
          pointHoverBorderColor: '#8e44ad',
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Cost Per Purchase',
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
            borderColor: '#16a085',
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '$ ' + value.toFixed(2); // Display with dollar sign and 2 decimal places
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
                return '$ ' + Number(value).toFixed(2);
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
  }

  initiateConversionValueChart(chartId: string, formattedDates: string[], data: number[]) {

    const color = '#c0392b';
    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Conversion Value',
          data: data,
          borderColor: color,
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: color,
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Conversion Value',
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
            borderColor: color,
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '$ ' + value.toFixed(2); // Display with dollar sign and 2 decimal places
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
  }

  initiateCostPerCartChart(chartId: string, formattedDates: string[], data: number[]) {
    const color = '#d35400';
    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Cost Per Add to Cart',
          data: data,
          borderColor: color,
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: color,
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Cost Per Add to Cart',
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
            borderColor: color,
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '$ ' + value.toFixed(2); // Display with dollar sign and 2 decimal places
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
                return '$ ' + Number(value).toFixed(2);
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
  }
  
  initiateInitiatedCheckoutsChart(chartId: string, formattedDates: string[], data: number[]) {
    const color = '#27ae60';
    new Chart(chartId, {
      type: 'line',
      data: {
        labels: formattedDates,
        datasets: [{
          label: 'Initiated Checkouts',
          data: data,
          borderColor: color,
          borderWidth: 2,
          // fill: true,
          tension: 0.3,
          pointRadius: 2.5,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: color,
          pointHoverBorderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Initiated Checkouts',
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
            borderColor: color,
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
                // return `${context.parsed.y}`;
              }
            }
          },
          // ADD DATALABELS CONFIGURATION HERE
          datalabels: {
            display: true,
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
              return '' + value.toFixed(0); // Display with dollar sign and 2 decimal places
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
                return '' + Number(value).toFixed(0);
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

    // Spend Chart
    this.initiateDailySpendChart('spendChart', formattedDates);

    // ROAS Chart
    this.initiateRoasChart('roasChart', formattedDates);

    // Conversion Chart
    this.initiateConversionChart('conversionChart', formattedDates);

    // Engagement Chart
    this.initiateEngagementChart('engagementChart', formattedDates);

    // CTR Chart
    this.initiateCtrChart('ctrChart', formattedDates, this.graphs.map(g => parseFloat(g.ctr)));

    // CPC Chart
    this.initiateCpcChart('cpcChart', formattedDates, this.graphs.map(g => parseFloat(g.cpc)));

    // Cost Per Purchase Chart
    this.initiateCppChart('costPerPurchaseChart', formattedDates, this.graphs.map(g => parseFloat(g.costPerPurchase)));

    // Conversion Value Chart
    this.initiateConversionValueChart('conversionValueChart', formattedDates, this.graphs.map(g => parseFloat(g.conversionValue)));

    // Cost Per Add to Cart Chart
    this.initiateCostPerCartChart('costPerCartChart', formattedDates, this.graphs.map(g => parseFloat(g.costPerAddToCart)));

    // Initiated Checkouts Chart
    this.initiateInitiatedCheckoutsChart('checkoutsChart', formattedDates, this.graphs.map(g => parseInt(g.initiatedCheckouts)));
  //   new Chart('checkoutsChart', {
  //     type: 'line',
  //     data: {
  //       labels: formattedDates,
  //       datasets: [{
  //         label: 'Initiated Checkouts',
  //         data: this.graphs.map(g => parseInt(g.initiatedCheckouts)),
  //         borderColor: '#27ae60'
  //       }]
  //     },
  //     options: {
  //       responsive: true,
  //       plugins: {
  //         title: {
  //           display: true,
  //           text: 'Initiated Checkouts'
  //         }
  //       }
  //     }
  //   });
  }

  toggleGraphVisibility(graphId: string) {
    const graph = this.utilGtmlGraphs.find(g => g.id === graphId);
    if (graph) {
      graph.isVisible = !graph.isVisible;
      this.ref.detectChanges();
    }
  }

  getVisibleGraphs() {
    return this.utilGtmlGraphs.filter(graph => graph.isVisible);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  getVisibleGraphsCount() {
    return this.utilGtmlGraphs.filter(g => g.isVisible).length;
  }

  onGraphDrop(event: CdkDragDrop<{id: string, title: string, isVisible: boolean}[]>) {
    moveItemInArray(this.utilGtmlGraphs, event.previousIndex, event.currentIndex);
    this.ref.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.isDropdownOpen && 
        this.dropdownContainer && 
        !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  ngOnDestroy() {
    // Cleanup any subscriptions or resources if needed
  }

  private initializeColors() {
    // Initialize header color
    const savedHeaderColor = localStorage.getItem('headerBackgroundColor');
    if (savedHeaderColor) {
      this.headerBackgroundColor = savedHeaderColor;
      this.applyHeaderColor(savedHeaderColor);
    }

    // Initialize dashboard color
    const savedDashboardColor = localStorage.getItem('dashboardBackgroundColor');
    if (savedDashboardColor) {
      this.dashboardBackgroundColor = savedDashboardColor;
      this.applyDashboardColor(savedDashboardColor);
    }
  }

  onHeaderColorChange(color: string) {
    this.applyHeaderColor(color);
    localStorage.setItem('headerBackgroundColor', color);
  }

  onDashboardColorChange(color: string) {
    this.applyDashboardColor(color);
    localStorage.setItem('dashboardBackgroundColor', color);
  }

  private applyHeaderColor(color: string) {
    document.documentElement.style.setProperty('--header-bg-color', color);
  }

  private applyDashboardColor(color: string) {
    document.documentElement.style.setProperty('--dashboard-bg-color', color);
  }

  private formatNumber(value: number, format: string): string {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: parseInt(format.split('-')[1] || '0'),
      maximumFractionDigits: parseInt(format.split('-')[1] || '0')
    }).format(value);
  }

  toggleKpiDropdown() {
    this.isKpiDropdownOpen = !this.isKpiDropdownOpen;
    if (this.isKpiDropdownOpen) {
      document.addEventListener('click', this.handleClickOutside);
    } else {
      document.removeEventListener('click', this.handleClickOutside);
    }
  }

  handleClickOutside = (event: MouseEvent) => {
    if (
      this.kpiDropdownContainer &&
      !this.kpiDropdownContainer.nativeElement.contains(event.target)
    ) {
      this.isKpiDropdownOpen = false;
      document.removeEventListener('click', this.handleClickOutside);
    }
  };

  onKpiDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.kpiItems, event.previousIndex, event.currentIndex);
    this.saveKpiSettings();
  }

  toggleKpiVisibility(kpiId: string) {
    const kpi = this.kpiItems.find(item => item.id === kpiId);
    if (kpi) {
      kpi.isVisible = !kpi.isVisible;
      this.saveKpiSettings();
    }
  }

  private loadKpiSettings() {
    const savedSettings = localStorage.getItem('kpiSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.kpiItems = this.kpiItems.map(kpi => ({
        ...kpi,
        isVisible: settings.visibility[kpi.id] ?? true
      }));
      
      // Restore order
      if (settings.order) {
        const orderedItems: KpiItem[] = [];
        settings.order.forEach((id: string) => {
          const item = this.kpiItems.find(kpi => kpi.id === id);
          if (item) orderedItems.push(item);
        });
        this.kpiItems = orderedItems;
      }
    }
  }

  private saveKpiSettings() {
    const settings = {
      visibility: Object.fromEntries(
        this.kpiItems.map(kpi => [kpi.id, kpi.isVisible])
      ),
      order: this.kpiItems.map(kpi => kpi.id)
    };
    localStorage.setItem('kpiSettings', JSON.stringify(settings));
  }
}
