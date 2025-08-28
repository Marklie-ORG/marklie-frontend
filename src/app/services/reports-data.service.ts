import {inject, Injectable} from '@angular/core';
import { SchedulingOption } from '../pages/edit-report/edit-report.component';
import { GetAvailableMetricsResponse, AvailableMetricsAdAccountCustomMetric, Provider, AdAccountScheduleReportRequest, SectionScheduleReportRequest, MetricScheduleReportRequest, CustomMetricScheduleReportRequest} from '../interfaces/interfaces';
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { SchedulesService } from "./api/schedules.service.js";
import { ReportData, KpiAdAccountData, GraphsAdAccountData, AdsAdAccountData, TableAdAccountData, AdsAdAccountDataCreative } from '../interfaces/get-report.interfaces';
import { ReportSection, AdAccount, Metric, MetricDataPoint } from '../interfaces/report-sections.interfaces';
import { AdAccountsService } from './api/ad-accounts.service.js';
import { UserService } from './api/user.service.js';


@Injectable({
  providedIn: 'root'
})
export class ReportsDataService {
  private schedulesService = inject(SchedulesService);
  private adAccountsService = inject(AdAccountsService);
  private userService = inject(UserService);
  readonly chartConfigs = [
    { key: 'spend', label: 'Daily Spend', color: '#1F8DED', format: (v: any) => `$${v}` },
    { key: 'purchaseRoas', label: 'ROAS', color: '#2ecc71', format: (v: any) => `${v}x` },
    { key: 'conversionValue', label: 'Conversion Value', color: '#c0392b', format: (v: any) => `$${v}` },
    { key: 'purchases', label: 'Purchases', color: '#e74c3c', format: (v: any) => `${v}` },
    { key: 'addToCart', label: 'Add to Cart', color: '#f1c40f', format: (v: any) => `${v}` },
    { key: 'initiatedCheckouts', label: 'Checkouts', color: '#9b59b6', format: (v: any) => `${v}` },
    { key: 'clicks', label: 'Clicks', color: '#e67e22', format: (v: any) => `${v}` },
    { key: 'impressions', label: 'Impressions', color: '#1abc9c', format: (v: any) => `${v}` },
    { key: 'ctr', label: 'CTR', color: '#34495e', format: (v: any) => `${v}%` },
    { key: 'cpc', label: 'CPC', color: '#16a085', format: (v: any) => `$${v}` },
    { key: 'costPerPurchase', label: 'Cost Per Purchase', color: '#8e44ad', format: (v: any) => `$${v}` },
    { key: 'costPerCart', label: 'Cost Per Add to Cart', color: '#d35400', format: (v: any) => `$${v}` }
  ];

  availableMetrics: GetAvailableMetricsResponse = [];

  readonly DATE_PRESETS = [
    { value: 'today', text: 'Today' },
    { value: 'yesterday', text: 'Yesterday' },
    { value: 'this_month', text: 'This Month' },
    { value: 'last_month', text: 'Last Month' },
    { value: 'this_quarter', text: 'This Quarter' },
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
    { value: 'this_year', text: 'This Year' },
    { value: 'maximum', text: 'Maximum' }
  ];
  readonly DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  getChartConfigs() {
    return this.chartConfigs;
  }

  async getReportsSectionsBasedOnSchedulingOption(schedulingOption: SchedulingOption): Promise<ReportSection[]> {

    let reportSections: ReportSection[] = [];

    const availableMetrics = await this.schedulesService.getAvailableMetrics(schedulingOption.client.uuid);

    const providers = schedulingOption.jobData.providers;
    const facebookProvider = providers.find(p => p.provider === 'facebook');

    // helpers to generate lightweight preview data (keep scoped to this method)
    const generateDateSeries = (days: number = 10) => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString());
      }
      return dates;
    };

    const randomFor = (metricName: string): number => {
      const name = (metricName || '').toLowerCase();
      if (name.includes('roas')) return +(Math.random() * 4 + 0.5).toFixed(2);
      if (name.includes('ctr') || name.includes('rate')) return +(Math.random() * 5).toFixed(2);
      if (name.includes('cpc') || name.includes('cpm') || name.includes('cpp')) return +(Math.random() * 3 + 0.2).toFixed(2) as unknown as number;
      if (name.includes('spend') || name.includes('cost') || name.includes('value')) return +(Math.random() * 1500).toFixed(2) as unknown as number;
      if (name.includes('impressions') || name.includes('reach')) return Math.floor(Math.random() * 50000 + 1000);
      if (name.includes('click')) return Math.floor(Math.random() * 2000 + 50);
      if (name.includes('purchase') || name.includes('purchases')) return Math.floor(Math.random() * 120);
      if (name.includes('add_to_cart') || name.includes('addtocart') || name.includes('cart')) return Math.floor(Math.random() * 200);
      if (name.includes('checkout')) return Math.floor(Math.random() * 150);
      if (name.includes('engagement')) return Math.floor(Math.random() * 1000);
      return +(Math.random() * 100).toFixed(2) as unknown as number;
    };

    for (let section of facebookProvider?.sections || []) {

      let adAccounts: AdAccount[] = [];

      for (let adAccount of section.adAccounts) {

        const adAccountId = adAccount.adAccountId;

        const adAccountAvailableMetrics = availableMetrics.find(adAccountAvailableMetrics => adAccountAvailableMetrics.adAccountId === adAccountId)!.adAccountMetrics;
        const sectionAdAccountAvailableMetrics = adAccountAvailableMetrics[section.name];
        const customAdAccountAvailableMetrics = adAccountAvailableMetrics.customMetrics;

        let metrics: Metric[] = [];

        for (let metric of adAccount.metrics) {
          metrics.push({
            name: metric.name,
            order: metric.order,
            enabled: true,
            isCustom: false
          })
        }

        for (let metric of adAccount.customMetrics) {
          metrics.push({
            name: metric.name,
            order: metric.order,
            enabled: true,
            isCustom: true,
            id: metric.id
          })
        }

        metrics.sort((a, b) => a.order - b.order);

        for (let metric of sectionAdAccountAvailableMetrics) {
          if (!metrics.find(m => m.name === metric)) {
            metrics.push({
              name: metric,
              order: -1,
              enabled: false,
              isCustom: false
            })
          }
        }

        for (let metric of customAdAccountAvailableMetrics) {
          if (!metrics.find(m => m.name === metric.name)) {
            metrics.push({
              name: metric.name,
              order: -1,
              enabled: false,
              isCustom: true,
              id: metric.id
            })
          }
        }

        // Ensure 'impressions' is always present and enabled for the 'ads' section
        if (section.name === 'ads') {
          const impressions = metrics.find(m => m.name === 'impressions');
          if (impressions) {
            impressions.enabled = true;
          } else {
            metrics.push({
              name: 'impressions',
              order: metrics.length,
              enabled: true,
              isCustom: false,
              id: ''
            });
          }
        }

        // Build ad account object and attach preview data per section
        const adAccountObj: AdAccount = {
          id: adAccount.adAccountId,
          name: adAccount.adAccountName,
          metrics: metrics,
          order: adAccount.order,
          enabled: adAccount.enabled,
          currency: adAccount.currency
        };

        if (section.name === 'kpis') {
          adAccountObj.metrics = adAccountObj.metrics.map(m => ({ ...m, value: randomFor(m.name) }));
        } else if (section.name === 'graphs') {
          const dates = generateDateSeries(10);
          adAccountObj.metrics = adAccountObj.metrics.map(m => ({
            ...m,
            dataPoints: dates.map(date => ({ date, value: randomFor(m.name) }))
          }));
        } else if (section.name === 'ads') {
          const enabledMetrics = adAccountObj.metrics.filter(m => m.enabled);
          const metricsForCreative = enabledMetrics.length ? enabledMetrics : adAccountObj.metrics.slice(0, 3);

          adAccountObj.creativesData = Array.from({ length: 3 }).map((_, i) => ({
            adId: `${adAccount.adAccountId}-ad-${i + 1}`,
            ad_name: `Ad ${i + 1}`,
            adCreativeId: `${adAccount.adAccountId}-creative-${i + 1}`,
            sourceUrl: `https://facebook.com/ads/${i + 1}`,
            thumbnailUrl: '/assets/img/2025-03-19%2013.02.21.jpg',
            data: metricsForCreative.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          })) as any;
        } else if (section.name === 'campaigns') {
          const enabledMetrics = adAccountObj.metrics.filter(m => m.enabled);
          const metricsForRow = enabledMetrics.length ? enabledMetrics : adAccountObj.metrics.slice(0, 3);

          adAccountObj.campaignsData = Array.from({ length: 3 }).map((_, i) => ({
            index: i,
            campaign_name: `Campaign ${i + 1}`,
            data: metricsForRow.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          })) as any;
        }

        adAccounts.push(adAccountObj)

      }

      reportSections.push({
        key: section.name,
        title: section.name,
        enabled: section.enabled,
        adAccounts: adAccounts,
        order: section.order
      })

    }

    reportSections = await this.appendCurrencyToMetrics(reportSections);
    return this.appendPercentForSpecificMetrics(reportSections)
  }

  async getReportsSectionsBasedOnReportData(providers: ReportData): Promise<ReportSection[]> {

    let reportSections: ReportSection[] = [];

    const facebookProvider = providers.find(p => p.provider === 'facebook');

    for (let section of facebookProvider?.sections || []) {

      let adAccounts: AdAccount[] = [];

      for (let adAccount of section.adAccounts) {

        let metrics: Metric[] = [];
        let campaignsDataVar: TableAdAccountData | undefined;
        let creativesDataVar: AdsAdAccountDataCreative[] | undefined;

        if (section.name === 'kpis') {
          const kpiData = adAccount.data as KpiAdAccountData;
          metrics = kpiData.map(m => ({
            name: m.name,
            order: m.order,
            enabled: m.enabled === undefined ? true : m.enabled,
            value: m.value
          }));
        } else if (section.name === 'graphs') {
          let metricsList: {name: string, order: number, enabled: boolean}[] = []

          for (let point of adAccount.data as GraphsAdAccountData) {
            for (let dataPoint of point.data) {
              if (!metricsList.find(m => m.name === dataPoint.name)) {
                metricsList.push({
                  name: dataPoint.name,
                  order: dataPoint.order,
                  enabled: dataPoint.enabled === undefined ? true : dataPoint.enabled
                });
              }
            }
          }

          for (let metric of metricsList) {
            let dataPoints: MetricDataPoint[] = [];

            for (let point of adAccount.data as GraphsAdAccountData) {
              for (let dataPoint of point.data) {
                if (dataPoint.name === metric.name) {
                  dataPoints.push({
                    value: dataPoint.value,
                    date: point.date_start
                  })
                }
              }
            }

            metrics.push({
              name: metric.name,
              order: metric.order,
              enabled: metric.enabled,
              dataPoints: dataPoints
            })
          }

        } else if (section.name === 'ads') {

          creativesDataVar = adAccount.data as AdsAdAccountData;

          // derive metrics map from creatives data points, capturing order and enabled state
          const metricMap = new Map<string, { order: number; enabled: boolean }>();
          if (Array.isArray(creativesDataVar)) {
            for (const creative of creativesDataVar) {
              for (const point of creative.data) {
                const current = metricMap.get(point.name);
                const pointEnabled = point.enabled === undefined ? true : point.enabled;
                if (!current) {
                  metricMap.set(point.name, { order: point.order, enabled: pointEnabled });
                } else {
                  metricMap.set(point.name, { order: Math.min(current.order, point.order), enabled: current.enabled || pointEnabled });
                }
              }
            }
          }
          metrics = Array.from(metricMap.entries())
            .map(([name, v]) => ({ name, order: v.order, enabled: v.enabled }))
            .sort((a, b) => a.order - b.order);
          // Ensure 'impressions' is always included and enabled
          const impressions = metrics.find(m => m.name === 'impressions');
          if (impressions) {
            impressions.enabled = true;
          } else {
            metrics.push({ name: 'impressions', order: metrics.length, enabled: true });
          }

        } else if (section.name === 'campaigns') {
           const tableData = adAccount.data as TableAdAccountData;
           const metricMap = new Map<string, { order: number; enabled: boolean }>();
           for (const campaign of tableData) {
             for (const point of campaign.data) {
               const current = metricMap.get(point.name);
               const pointEnabled = point.enabled === undefined ? true : point.enabled;
               if (!current) {
                 metricMap.set(point.name, { order: point.order, enabled: pointEnabled });
               } else {
                 metricMap.set(point.name, { order: Math.min(current.order, point.order), enabled: current.enabled || pointEnabled });
               }
             }
           }
           metrics = Array.from(metricMap.entries())
             .map(([name, v]) => ({ name, order: v.order, enabled: v.enabled }))
             .sort((a, b) => a.order - b.order);
           campaignsDataVar = tableData;
        }

        const adAccountObj: AdAccount = {
          id: adAccount.adAccountId,
          name: adAccount.adAccountName,
          metrics: metrics,
          order: adAccount.order,
          enabled: adAccount.enabled === undefined ? true : adAccount.enabled,
          currency: adAccount.currency
        };
        if (campaignsDataVar) {
          adAccountObj.campaignsData = campaignsDataVar;
        }
        if (creativesDataVar) {
          adAccountObj.creativesData = creativesDataVar;
        }
        adAccounts.push(adAccountObj)

      }

      reportSections.push({
        key: section.name,
        title: section.name,
        enabled: section.enabled === undefined ? true : section.enabled,
        adAccounts: adAccounts,
        order: section.order
      })

    }

    reportSections = this.roundValues(reportSections);

    reportSections = await this.appendCurrencyToMetrics(reportSections);
    return this.appendPercentForSpecificMetrics(reportSections)
  }

  roundValues(reportSections: ReportSection[]): ReportSection[] {
    const toNumber = (val: any): number | null => {
      const n = typeof val === 'number' ? val : parseFloat(val);
      return Number.isNaN(n) ? null : n;
    };

    const roundIfDecimal = (val: any): number => {
      const n = toNumber(val);
      if (n === null) return val as number;
      return Number.isInteger(n) ? n : Math.round((n + Number.EPSILON) * 100) / 100;
    };

    const roundedSections = reportSections.map(section => ({
      ...section,
      adAccounts: section.adAccounts.map(adAccount => {
        const roundedMetrics = adAccount.metrics.map(metric => {
          const roundedMetric: Metric = { ...metric };

          if (roundedMetric.value !== undefined) {
            roundedMetric.value = roundIfDecimal(roundedMetric.value as number);
          }

          if (Array.isArray(roundedMetric.dataPoints)) {
            roundedMetric.dataPoints = roundedMetric.dataPoints.map(dp => ({
              ...dp,
              value: roundIfDecimal(dp.value)
            }));
          }

          return roundedMetric;
        });

        const roundedCampaigns = adAccount.campaignsData
          ? adAccount.campaignsData.map(c => ({
              ...c,
              data: c.data.map(point => ({
                ...point,
                value: roundIfDecimal(point.value)
              }))
            }))
          : undefined;

        const roundedCreatives = adAccount.creativesData
          ? adAccount.creativesData.map(creative => ({
              ...creative,
              data: creative.data.map(point => ({
                ...point,
                value: roundIfDecimal(point.value)
              }))
            }))
          : undefined;

        return {
          ...adAccount,
          metrics: roundedMetrics,
          campaignsData: roundedCampaigns,
          creativesData: roundedCreatives
        };
      })
    }));

    return roundedSections;
  }


  async getDefaultReportsSections(
    clientUuid: string
  ): Promise<ReportSection[]> {

    let reportSections: ReportSection[] = [
      {
        key: 'kpis',
        title: 'Main KPIs',
        enabled: true,
        adAccounts: [],
        order: 0
      },
      {
        key: 'graphs',
        title: 'Graphs',
        enabled: true,
        adAccounts: [],
        order: 1
      },
      {
        key: 'ads',
        title: 'Best creatives',
        enabled: true,
        adAccounts: [],
        order: 2
      },
      {
        key: 'campaigns',
        title: 'Best campaigns',
        enabled: true,
        adAccounts: [],
        order: 3
      }
    ]

    const availableMetrics = await this.schedulesService.getAvailableMetrics(clientUuid);

    // helpers to generate lightweight preview data
    const generateDateSeries = (days: number = 10) => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString());
      }
      return dates;
    };

    const randomFor = (metricName: string): number => {
      const name = (metricName || '').toLowerCase();
      if (name.includes('roas')) return +(Math.random() * 4 + 0.5).toFixed(2);
      if (name.includes('ctr') || name.includes('rate')) return +(Math.random() * 5).toFixed(2);
      if (name.includes('cpc') || name.includes('cpm') || name.includes('cpp')) return +(Math.random() * 3 + 0.2).toFixed(2) as unknown as number;
      if (name.includes('spend') || name.includes('cost') || name.includes('value')) return +(Math.random() * 1500).toFixed(2) as unknown as number;
      if (name.includes('impressions') || name.includes('reach')) return Math.floor(Math.random() * 50000 + 1000);
      if (name.includes('click')) return Math.floor(Math.random() * 2000 + 50);
      if (name.includes('purchase') || name.includes('purchases')) return Math.floor(Math.random() * 120);
      if (name.includes('add_to_cart') || name.includes('addtocart') || name.includes('cart')) return Math.floor(Math.random() * 200);
      if (name.includes('checkout')) return Math.floor(Math.random() * 150);
      if (name.includes('engagement')) return Math.floor(Math.random() * 1000);
      return +(Math.random() * 100).toFixed(2) as unknown as number;
    };

    const currencyMap = new Map<string, string>();
    await Promise.all(
      availableMetrics.map(async (adAccount) => {
        const response = await this.adAccountsService.getAdAccountCurrency(adAccount.adAccountId);
        let symbol = (response as any)?.currency || '';
        if (symbol === 'USD') symbol = '$';
        if (symbol === 'EUR') symbol = '€';
        currencyMap.set(adAccount.adAccountId, symbol);
      })
    );

    for (let section of reportSections) {
      const sectionKey = section.key;

      for (let [idx, adAccount] of availableMetrics.entries()) {
        const availableMetricsAdAccount = adAccount.adAccountMetrics;
        const sectionMetrics = availableMetricsAdAccount[sectionKey];
        const customMetrics = availableMetricsAdAccount.customMetrics;

        // base metrics for this ad account and section
        let metrics = this.getMetrics(sectionMetrics, customMetrics);
        // normalize order
        metrics.forEach((m, i) => (m.order = i));

        // Ensure 'impressions' is always present and enabled for the 'ads' section
        if (sectionKey === 'ads') {
          const impressions = metrics.find(m => m.name === 'impressions');
          metrics = metrics.filter(m => m.name !== 'ad_name');
          if (impressions) {
            impressions.enabled = true;
          } else {
            metrics.push({
              name: 'impressions',
              order: metrics.length,
              enabled: true,
              isCustom: false,
              id: ''
            });
          }
        }

        const currencySymbol = currencyMap.get(adAccount.adAccountId) ?? '';

        const adAccountObj: AdAccount = {
          id: adAccount.adAccountId,
          name: adAccount.adAccountName,
          metrics: metrics,
          order: idx,
          enabled: true,
          currency: currencySymbol
        };

        // attach lightweight preview data per section so UI can render something meaningful
        if (sectionKey === 'kpis') {
          adAccountObj.metrics = adAccountObj.metrics.map(m => ({ ...m, value: randomFor(m.name) }));
        } else if (sectionKey === 'graphs') {
          const dates = generateDateSeries(10);
          adAccountObj.metrics = adAccountObj.metrics.map(m => ({
            ...m,
            dataPoints: dates.map(date => ({ date, value: randomFor(m.name) }))
          }));
        } else if (sectionKey === 'ads') {
          const enabledMetrics = adAccountObj.metrics.filter(m => m.enabled);
          const metricsForCreative = enabledMetrics.length ? enabledMetrics : adAccountObj.metrics.slice(0, 3);

          const creatives = Array.from({ length: 3 }).map((_, i) => ({
            adId: `${adAccount.adAccountId}-ad-${i + 1}`,
            ad_name: `Ad ${i + 1}`,
            adCreativeId: `${adAccount.adAccountId}-creative-${i + 1}`,
            sourceUrl: `https://facebook.com/ads/${i + 1}`,
            thumbnailUrl: '/assets/img/2025-03-19%2013.02.21.jpg',
            data: metricsForCreative.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          }));

          adAccountObj.creativesData = creatives as any;
        } else if (sectionKey === 'campaigns') {
          const enabledMetrics = adAccountObj.metrics.filter(m => m.enabled);
          const metricsForRow = enabledMetrics.length ? enabledMetrics : adAccountObj.metrics.slice(0, 3);

          const campaigns = Array.from({ length: 3 }).map((_, i) => ({
            index: i,
            campaign_name: `Campaign ${i + 1}`,
            data: metricsForRow.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          }));

          adAccountObj.campaignsData = campaigns as any;
        }

        section.adAccounts.push(adAccountObj);
      }

    }

    reportSections = await this.appendCurrencyToMetrics(reportSections);
    return this.appendPercentForSpecificMetrics(reportSections)
  }

  getMetrics(metrics: string[], customMetrics: AvailableMetricsAdAccountCustomMetric[]): Metric[] {

    const metricsToReturn = [
      ...metrics.map((metric, index) => ({
        name: metric,
        order: index,
        enabled: false,
        isCustom: false,
        id: ''
      })).sort((a, b) => a.name.localeCompare(b.name)),
      ...customMetrics.map((metric, index) => ({
        name: metric.name,
        order: index,
        enabled: false,
        isCustom: true,
        id: metric.id
      })).sort((a, b) => a.name.localeCompare(b.name))
    ]

    // Enable first 3 usual metrics
    metricsToReturn
      .filter(m => !m.isCustom)
      .slice(0, 3)
      .forEach(m => m.enabled = true);

    // Enable first 3 custom metrics
    metricsToReturn
      .filter(m => m.isCustom)
      .slice(0, 3)
      .forEach(m => m.enabled = true);

    return metricsToReturn;
  }

  getProviders(reportSections: ReportSection[]): Provider[] {
    const providers: Provider[] = [];

    const facebookProvider: Provider = {
      provider: 'facebook',
      sections: []
    }

    let sections: SectionScheduleReportRequest[] = [];

    for (const [sectionIndex, section] of reportSections.entries()) {

      // if (!section.enabled) continue; // dont add section if its disabled

      let adAccounts: AdAccountScheduleReportRequest[] = [];

      for (const [adAccountIndex, adAccount] of section.adAccounts.entries()) {

        // if (!adAccount.enabled) continue; // dont add ad account if its disabled

        let metrics: MetricScheduleReportRequest[] = [];
        let customMetrics: CustomMetricScheduleReportRequest[] = [];

        for (const metric of adAccount.metrics) {
          if (!metric.enabled) continue;

          if (metric.isCustom) {
            customMetrics.push({
              name: metric.name,
              order: metric.order,
              id: metric.id!
            })
          } else {
            metrics.push({
              name: metric.name,
              order: metric.order
            })
          }
        }

        adAccounts.push({
          adAccountId: adAccount.id,
          adAccountName: adAccount.name,
          order: adAccount.order,
          enabled: adAccount.enabled,
          metrics: metrics,
          customMetrics: customMetrics,
          currency: adAccount.currency
        })

      }
      
      sections.push({
        name: section.key,
        order: section.order,
        enabled: section.enabled,
        adAccounts: adAccounts
      })

    }

    facebookProvider.sections = sections;

    providers.push(facebookProvider);

    return providers;
  }

  getDateRangeLabel(graphs: any[]): string {
    if (!graphs.length) return '';
    const start = new Date(graphs[0].date_start);
    const end = new Date(graphs.at(-1)?.date_stop || graphs.at(-1)?.date_start);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()} (${diffDays} days)`;
  }


  aggregateReports(data: any[]): any {
    const mergedKPIs: any = {};
    const mergedGraphs: any[] = [];
    const mergedCampaigns: any[] = [];
    const mergedAds: any[] = [];

    const kpiKeys = Object.keys(data[0]?.KPIs || {});
    for (const key of kpiKeys) {
      const total = data.reduce((sum, d) => sum + parseFloat(d.KPIs[key] || 0), 0);
      mergedKPIs[key] = (total / data.length).toFixed(2);
    }

    const graphLength = data[0]?.graphs.length || 0;
    for (let i = 0; i < graphLength; i++) {
      const entry = { ...data[0].graphs[i] };
      for (const key of Object.keys(entry)) {
        if (key === 'date_start' || key === 'date_stop') continue;
        const avg = data.reduce((sum, d) => sum + parseFloat(d.graphs[i]?.[key] || 0), 0) / data.length;
        entry[key] = avg.toFixed(2);
      }
      mergedGraphs.push(entry);
    }

    mergedCampaigns.push(...data.flatMap(d => d.campaigns || []));
    mergedAds.push(...data.flatMap(d => d.ads || []).sort((a, b) => Number(b.purchases) - Number(a.purchases)).slice(0, 10));

    return { KPIs: mergedKPIs, graphs: mergedGraphs, campaigns: mergedCampaigns, ads: mergedAds };
  }

  formatMetricLabel(metric: string): string {
    return metric
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase());
  }

  formatMetricValue(metric: string, value: any): string {
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return value ?? '—';

    const rounded = num.toFixed(2);
    if (['spend', 'cpc'].includes(metric)) return `$${rounded}`;
    if (metric.includes('ctr') || metric.includes('conversion rate') || metric.includes('conversion_rate')) return `${rounded}%`;
    if (metric.includes('roas')) return `${rounded}x`;
    return Number(num).toLocaleString();
  }

  private appendPercentForSpecificMetrics(reportSections: ReportSection[]): ReportSection[] {
    const shouldAppendPercent = (metricName: string): boolean => {
      if (!metricName) return false;
      const name = metricName.toLowerCase();
      return (
        name.includes('ctr') ||
        name.includes('click-through rate') || name.includes('click through rate') || name.includes('click_through_rate') ||
        name.includes('conversion rate') || name.includes('conversion_rate')
      );
    };

    return reportSections.map(section => ({
      ...section,
      adAccounts: section.adAccounts.map(adAccount => ({
        ...adAccount,
        metrics: adAccount.metrics.map(metric => {
          const updated: Metric = { ...metric };
          if (shouldAppendPercent(updated.name)) {
            updated.symbol = '%';
          }
          return updated;
        }),
        campaignsData: adAccount.campaignsData?.map(c => ({
          ...c,
          data: c.data.map(point => ({
            ...point,
            symbol: shouldAppendPercent(point.name) ? '%' : point.symbol
          }))
        })),
        creativesData: adAccount.creativesData?.map(creative => ({
          ...creative,
          data: creative.data.map(point => ({
            ...point,
            symbol: shouldAppendPercent(point.name) ? '%' : point.symbol
          }))
        }))
      }))
    }));
  }

  private isCurrencyMetric(metricName: string): boolean {
    if (!metricName) return false;
    const normalized = metricName.toLowerCase().replace(/\s|_/g, '');
    const currencyMetrics = new Set([
      'spend',
      'conversionvalue',
      'cpc',
      'cpm',
      'cpp',
      'costperlead',
      'costperaddtocart',
      'costperpurchase',
      // common camelCase variants used elsewhere
      'costpercart',
      'costperpurchase'
    ]);
    return currencyMetrics.has(normalized);
  }

  private async appendCurrencyToMetrics(reportSections: ReportSection[]): Promise<ReportSection[]> {
    try {
      const withCurrency = reportSections.map(section => ({
        ...section,
        adAccounts: section.adAccounts.map(adAccount => {
          const currency = adAccount.currency;

          const metrics = adAccount.metrics.map(metric => this.isCurrencyMetric(metric.name)
            ? ({ ...metric, currency })
            : metric
          );

          const campaignsData = adAccount.campaignsData?.map(c => ({
            ...c,
            data: c.data.map(point => this.isCurrencyMetric(point.name)
              ? ({ ...point, currency })
              : point
            )
          }));

          const creativesData = adAccount.creativesData?.map(creative => ({
            ...creative,
            data: creative.data.map(point => this.isCurrencyMetric(point.name)
              ? ({ ...point, currency })
              : point
            )
          }));

          return { ...adAccount, metrics, campaignsData, creativesData } as AdAccount;
        })
      }));

      return withCurrency;
    } catch {
      return reportSections;
    }
  }

  renderCharts(graphs: any[], chartStore: Record<string, Chart>, dateLabel: string, prefix = '') {
    const labels = graphs.map(g =>
      new Date(g.date_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    for (const config of this.getChartConfigs()) {
      const canvasId = `${prefix}_${config.key}_Chart`;

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) continue;

      const hasData = graphs.some(g => g[config.key] !== undefined && g[config.key] !== null);
      if (hasData) {
        if (canvas) {
          canvas.style.display = 'block';
        }
      } else {
        if (canvas) {
          canvas.style.display = 'none';
        }
        continue;
      }

      const data = graphs.map(g => parseFloat(g[config.key] ?? 0));

      const existingChart = Chart.getChart(canvasId);
      if (existingChart) {
        existingChart.destroy();
      }

      chartStore[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: config.label,
            data,
            borderColor: config.color,
            pointBackgroundColor: config.color,
            tension: 0.3,
            pointRadius: 3,
            fill: false,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${config.label} (${dateLabel})`,
              font: { size: 16 },
            },
            datalabels: { display: false },
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: value => config.format(Number(value).toFixed(0))
              }
            }
          }
        },
        plugins: [ChartDataLabels]
      });
    }
  }

}
