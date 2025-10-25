import {inject, Injectable} from '@angular/core';
import { SchedulingOption } from '../pages/edit-report/edit-report.component';
import { GetAvailableMetricsResponse, AvailableMetricsAdAccountCustomMetric, Provider, AdAccountScheduleReportRequest, SectionScheduleReportRequest, MetricScheduleReportRequest, CustomMetricScheduleReportRequest, FACEBOOK_DATE_PRESETS, CustomFormulaScheduleReportRequest, AvailableMetricsAdAccountCustomFormula} from '../interfaces/interfaces';
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { SchedulesService } from "./api/schedules.service.js";
import { ReportData, KpiAdAccountData, GraphsAdAccountData, AdsAdAccountData, TableAdAccountData, AdsAdAccountDataCreative } from '../interfaces/get-report.interfaces';
import { ReportSection, AdAccount, Metric, MetricDataPoint } from '../interfaces/report-sections.interfaces';
import { AdAccountsService } from './api/ad-accounts.service.js';
import { ReportService } from './api/report.service';
import { NotificationService } from './notification.service';


@Injectable({
  providedIn: 'root'
})
export class ReportsDataService {
  private schedulesService = inject(SchedulesService);
  private adAccountsService = inject(AdAccountsService);
  private reportService = inject(ReportService);
  private notificationService = inject(NotificationService);

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
    // { value: 'today', text: 'Today' },
    // { value: 'yesterday', text: 'Yesterday' },
    // { value: 'this_month', text: 'This Month' }, // broken graphs
    // { value: 'this_quarter', text: 'This Quarter' },
    // { value: 'last_3d', text: 'Last 3 Days' },
    { value: 'last_7d', text: 'Last 7 Days' },
    { value: 'last_14d', text: 'Last 14 Days' },
    { value: 'last_28d', text: 'Last 28 Days' },
    { value: 'last_30d', text: 'Last 30 Days' },
    { value: 'last_month', text: 'Last Month' },
    { value: 'last_90d', text: 'Last 90 Days' },
    // { value: 'last_week_mon_sun', text: 'Last Week (Mon-Sun)' },
    // { value: 'last_week_sun_sat', text: 'Last Week (Sun-Sat)' },
    // { value: 'last_quarter', text: 'Last Quarter' },
    // { value: 'last_year', text: 'Last Year' },
    // { value: 'this_week_mon_today', text: 'This Week (Mon-Today)' },
    // { value: 'this_week_sun_today', text: 'This Week (Sun-Today)' },
    // { value: 'this_year', text: 'This Year' },
    // { value: 'maximum', text: 'Maximum' }
  ];
  readonly DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  getChartConfigs() {
    return this.chartConfigs;
  }

  getDateRangeForPreset(preset: FACEBOOK_DATE_PRESETS, baseDate?: Date): { start: Date; end: Date } {
    const today = baseDate ? new Date(baseDate) : new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const addDays = (d: Date, days: number) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + days);
      return nd;
    };

    const endYesterday = startOfDay(addDays(today, -1));

    const rangeForLastNDays = (n: number) => {
      const end = endYesterday;
      const start = addDays(end, -(n - 1));
      return { start, end };
    };

    switch (preset) {
      case FACEBOOK_DATE_PRESETS.TODAY: {
        const d = startOfDay(today);
        return { start: d, end: d };
      }
      case FACEBOOK_DATE_PRESETS.YESTERDAY: {
        const d = endYesterday;
        return { start: d, end: d };
      }
      case FACEBOOK_DATE_PRESETS.LAST_3D:
        return rangeForLastNDays(3);
      case FACEBOOK_DATE_PRESETS.LAST_7D:
        return rangeForLastNDays(7);
      case FACEBOOK_DATE_PRESETS.LAST_14D:
        return rangeForLastNDays(14);
      case FACEBOOK_DATE_PRESETS.LAST_28D:
        return rangeForLastNDays(28);
      case FACEBOOK_DATE_PRESETS.LAST_30D:
        return rangeForLastNDays(30);
      case FACEBOOK_DATE_PRESETS.LAST_90D:
        return rangeForLastNDays(90);
      case FACEBOOK_DATE_PRESETS.THIS_MONTH: {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = endYesterday;
        return { start, end };
      }
      case FACEBOOK_DATE_PRESETS.LAST_MONTH: {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return { start, end };
      }
      case FACEBOOK_DATE_PRESETS.THIS_QUARTER: {
        const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        const start = new Date(today.getFullYear(), quarterStartMonth, 1);
        const end = endYesterday;
        return { start, end };
      }
      case FACEBOOK_DATE_PRESETS.LAST_QUARTER: {
        const thisQuarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
        const start = new Date(today.getFullYear(), thisQuarterStartMonth - 3, 1);
        const end = new Date(today.getFullYear(), thisQuarterStartMonth, 0);
        return { start, end };
      }
      case FACEBOOK_DATE_PRESETS.THIS_YEAR: {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = endYesterday;
        return { start, end };
      }
      case FACEBOOK_DATE_PRESETS.LAST_YEAR: {
        const start = new Date(today.getFullYear() - 1, 0, 1);
        const end = new Date(today.getFullYear() - 1, 11, 31);
        return { start, end };
      }
      case FACEBOOK_DATE_PRESETS.MAXIMUM:
      default: {
        return rangeForLastNDays(7);
      }
    }
  }

  private formatDateShort(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  }

  getDateRangeTextForPreset(preset: FACEBOOK_DATE_PRESETS, baseDate?: Date): string {
    const { start, end } = this.getDateRangeForPreset(preset, baseDate);
    return `${this.formatDateShort(start)} - ${this.formatDateShort(end)}`;
  }

  async getReportsSectionsBasedOnSchedulingOption(schedulingOption: SchedulingOption): Promise<ReportSection[]> {

    let reportSections: ReportSection[] = [];

    const availableMetrics = await this.schedulesService.getAvailableMetrics(schedulingOption.client.uuid ?? schedulingOption.client);

    const providers = schedulingOption.providers;
    const facebookProvider = providers!.find(p => p.provider === 'facebook');

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
      if (name.includes('roas')) return 9;
      if (name.includes('ctr') || name.includes('rate')) return 9;
      if (name.includes('cpc') || name.includes('cpm') || name.includes('cpp')) return 9;
      if (name.includes('spend') || name.includes('cost') || name.includes('value')) return 999;
      if (name.includes('impressions') || name.includes('reach')) return 999;
      if (name.includes('click')) return 9999;
      if (name.includes('purchase') || name.includes('purchases')) return 999;
      if (name.includes('add_to_cart') || name.includes('addtocart') || name.includes('cart')) return 999;
      if (name.includes('checkout')) return 9999;
      if (name.includes('engagement')) return 9999;
      return 9;
    };

    for (let section of facebookProvider?.sections || []) {

      let adAccounts: AdAccount[] = [];
      let sectionTitle: string = ''

      for (let adAccount of section.adAccounts) {

        const adAccountId = adAccount.adAccountId;


        const adAccountAvailableMetrics = availableMetrics.find(adAccountAvailableMetrics => adAccountAvailableMetrics.adAccountId === adAccountId)!.adAccountMetrics;
        const sectionAdAccountAvailableMetrics = adAccountAvailableMetrics[section.name];
        const customAdAccountAvailableMetrics = adAccountAvailableMetrics.customMetrics;
        const customFormulasAdAccountAvailableMetrics = adAccountAvailableMetrics.customFormulas;

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
        

        if (adAccount.customFormulas) {
          for (let formula of adAccount.customFormulas) {
            metrics.push({
              name: formula.name,
              order: formula.order,
              enabled: true,
              isCustom: false,
              isCustomFormula: true,
              customFormulaUuid: formula.uuid
            })
          }
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

        for (let formula of customFormulasAdAccountAvailableMetrics) {
          if (!metrics.find(m => m.name === formula.name)) {
          metrics.push({
              name: formula.name,
              order: -1,
              enabled: false,
              isCustom: false,
              isCustomFormula: true,
              customFormulaUuid: formula.uuid
            })
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
          sectionTitle = 'Main KPIs'
          adAccountObj.metrics = adAccountObj.metrics.map(m => ({ ...m, value: randomFor(m.name) }));
        } else if (section.name === 'graphs') {
          sectionTitle = 'Graphs'
          const dates = generateDateSeries(10);
          adAccountObj.metrics = adAccountObj.metrics.map(m => ({
            ...m,
            dataPoints: dates.map(date => ({ date, value: randomFor(m.name) }))
          }));
        } else if (section.name === 'ads') {
          sectionTitle = 'Best creatives'
          const enabledMetrics = adAccountObj.metrics.filter(m => m.enabled);
          const metricsForCreative = enabledMetrics.length ? enabledMetrics : adAccountObj.metrics.slice(0, 3);

          adAccountObj.creativesData = Array.from({ length: 10 }).map((_, i) => ({
            adId: `${adAccount.adAccountId}-ad-${i + 1}`,
            adName: `Ad ${i + 1}`,
            adCreativeId: `${adAccount.adAccountId}-creative-${i + 1}`,
            sourceUrl: `https://facebook.com/ads/${i + 1}`,
            thumbnailUrl: '/assets/img/2025-03-19%2013.02.21.jpg',
            metrics: metricsForCreative.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          })) as any;

          adAccountObj.adsSettings = {
            maxAds: adAccount.adsSettings?.maxAds ?? 10,
            sortBy: adAccount.adsSettings?.sortBy ?? metricsForCreative[0]?.name
          };
        } else if (section.name === 'campaigns') {
          sectionTitle = 'Best campaigns'
          const enabledMetrics = adAccountObj.metrics.filter(m => m.enabled);
          const metricsForRow = enabledMetrics.length ? enabledMetrics : adAccountObj.metrics.slice(0, 3);

          adAccountObj.campaignsData = Array.from({ length: 3 }).map((_, i) => ({
            index: i,
            campaignName: `Campaign ${i + 1}`,
            metrics: metricsForRow.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          })) as any;
          adAccountObj.campaignsSettings = {
            maxCampaigns: adAccount.campaignsSettings?.maxCampaigns ?? 10,
            sortBy: adAccount.campaignsSettings?.sortBy ?? enabledMetrics[0]?.name
          };
        }

        adAccounts.push(adAccountObj)

      }

      reportSections.push({
        key: section.name,
        title: sectionTitle,
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
      let sectionTitle: string = ''

      for (let adAccount of section.adAccounts) {

        let metrics: Metric[] = [];
        let campaignsDataVar: TableAdAccountData | undefined;
        let creativesDataVar: AdsAdAccountDataCreative[] | undefined;

        if (section.name === 'kpis') {
          sectionTitle = 'Main KPIs'
          const kpiData = adAccount.data as KpiAdAccountData;
          metrics = kpiData.map(m => ({
            name: m.name,
            order: m.order,
            enabled: m.enabled === undefined ? true : m.enabled,
            value: m.value
          }));
        } 
        else if (section.name === 'graphs') {
          sectionTitle = 'Graphs'
          let metricsList: {name: string, order: number, enabled: boolean}[] = []

          for (let point of adAccount.data as GraphsAdAccountData) {
            for (let metric of point.metrics) {
              if (!metricsList.find(m => m.name === metric.name)) {
                metricsList.push({
                  name: metric.name,
                  order: metric.order,
                  enabled: metric.enabled === undefined ? true : metric.enabled
                });
              }
            }
          }

          console.log(metricsList)
          console.log(adAccount)  

          for (let metric of metricsList) {
            let dataPoints: MetricDataPoint[] = [];

            

            for (let point of adAccount.data as GraphsAdAccountData) {
              for (let p of point.metrics) {
                if (metric.name === p.name) {
                  dataPoints.push({
                    value: p.value,
                    date: point.date_start
                  })
                }
              }
            }

            console.log(dataPoints)

            metrics.push({
              name: metric.name,
              order: metric.order,
              enabled: metric.enabled,
              dataPoints: dataPoints
            })
          }

        } 
        else if (section.name === 'ads') {

          sectionTitle = 'Best creatives'
          creativesDataVar = adAccount.data as AdsAdAccountData;

          // derive metrics map from creatives data points, capturing order and enabled state
          const metricMap = new Map<string, { order: number; enabled: boolean }>();
          if (Array.isArray(creativesDataVar)) {
            for (const creative of creativesDataVar) {
              for (const metric of creative.metrics) {
                const current = metricMap.get(metric.name);
                const pointEnabled = metric.enabled === undefined ? true : metric.enabled;
                if (!current) {
                  metricMap.set(metric.name, { order: metric.order, enabled: pointEnabled });
                } else {
                  metricMap.set(metric.name, { order: Math.min(current.order, metric.order), enabled: current.enabled || pointEnabled });
                }
              }
            }
          }
          metrics = Array.from(metricMap.entries())
            .map(([name, v]) => ({ name, order: v.order, enabled: v.enabled }))
            .sort((a, b) => a.order - b.order);

        } 
        else if (section.name === 'campaigns') {

            sectionTitle = 'Best campaigns'
           const tableData = adAccount.data as TableAdAccountData;
           const metricMap = new Map<string, { order: number; enabled: boolean }>();
           for (const campaign of tableData) {
             for (const point of campaign.metrics) {
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
        title: sectionTitle,
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
              metrics: c.metrics.map(point => ({
                ...point,
                value: roundIfDecimal(point.value)
              }))
            }))
          : undefined;

        const roundedCreatives = adAccount.creativesData
          ? adAccount.creativesData.map(creative => ({
              ...creative,
              metrics: creative.metrics.map(metric => ({
                ...metric,
                value: roundIfDecimal(metric.value)
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
      if (name.includes('roas')) return 9;
      if (name.includes('ctr') || name.includes('rate')) return 9;
      if (name.includes('cpc') || name.includes('cpm') || name.includes('cpp')) return 9;
      if (name.includes('spend') || name.includes('cost') || name.includes('value')) return 999;
      if (name.includes('impressions') || name.includes('reach')) return 999;
      if (name.includes('click')) return 9999;
      if (name.includes('purchase') || name.includes('purchases')) return 999;
      if (name.includes('add_to_cart') || name.includes('addtocart') || name.includes('cart')) return 999;
      if (name.includes('checkout')) return 9999;
      if (name.includes('engagement')) return 9999;
      return 9;
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
        const customFormulas = availableMetricsAdAccount.customFormulas;

        // base metrics for this ad account and section
        let metrics = this.getMetrics(sectionMetrics, customMetrics, customFormulas);
        // normalize order
        metrics.forEach((m, i) => (m.order = i));

        // For KPIs, enforce default metrics and order
        if (sectionKey === 'kpis') {
          const normalizeName = (s: string) => (s || '').toLowerCase().replace(/\s|_/g, '');
          const desiredOrder = [
            'spend',
            'impressions',
            'cpm',
            'clicks',
            'cpc',
            'ctr',
            'purchases',
            'conversionvalue'
          ];

          const selected: Metric[] = [];
          for (const key of desiredOrder) {
            const found = metrics.find(m => normalizeName(m.name) === key);
            if (found) selected.push(found);
          }

          const remainder = metrics.filter(m => !selected.includes(m));
          selected.forEach((m, i) => { m.enabled = true; m.order = i; });

          let orderCounter = selected.length;
          const updatedRemainder = remainder.map(m => ({ ...m, enabled: false, order: orderCounter++ }));
          metrics = [...selected, ...updatedRemainder];
        }

        // Enforce default metric order per section
        const normalizeName = (s: string) => (s || '').toLowerCase().replace(/\s|_/g, '');
        const enforceOrder = (desired: string[]) => {
          const selected: Metric[] = [];
          for (const key of desired) {
            const found = key === 'roas'
              ? metrics.find(m => normalizeName(m.name).includes('roas'))
              : metrics.find(m => normalizeName(m.name) === key);
            if (found && !selected.includes(found)) selected.push(found);
          }
          const remainder = metrics.filter(m => !selected.includes(m));
          selected.forEach((m, i) => { m.enabled = true; m.order = i; });
          let orderCounter = selected.length;
          const updatedRemainder = remainder.map(m => ({ ...m, enabled: false, order: orderCounter++ }));
          return [...selected, ...updatedRemainder];
        };

        if (sectionKey === 'graphs') {
          metrics = enforceOrder(['spend', 'impressions', 'cpm', 'cpc', 'ctr', 'purchases']);
        }

        if (sectionKey === 'ads') {
          metrics = enforceOrder(['spend', 'impressions', 'ctr', 'purchases', 'roas']);
        }

        if (sectionKey === 'campaigns') {
          metrics = enforceOrder(['spend', 'impressions', 'purchases', 'conversionvalue']);
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

        if (sectionKey === 'ads') {
          adAccountObj.adsSettings = {
            maxAds: 10,
            sortBy: adAccountObj.metrics[0]?.name || ''
          };
        }

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

          const creatives = Array.from({ length: 10 }).map((_, i) => ({
            adId: `${adAccount.adAccountId}-ad-${i + 1}`,
            adName: `Ad ${i + 1}`,
            adCreativeId: `${adAccount.adAccountId}-creative-${i + 1}`,
            sourceUrl: `https://facebook.com/ads/${i + 1}`,
            thumbnailUrl: '/assets/img/2025-03-19%2013.02.21.jpg',
            metrics: metricsForCreative.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          }));

          adAccountObj.creativesData = creatives as any;
        } else if (sectionKey === 'campaigns') {
          const enabledMetrics = adAccountObj.metrics.filter(m => m.enabled);
          const metricsForRow = enabledMetrics.length ? enabledMetrics : adAccountObj.metrics.slice(0, 3);

          const campaigns = Array.from({ length: 3 }).map((_, i) => ({
            index: i,
            campaignName: `Campaign ${i + 1}`,
            metrics: metricsForRow.map((m, k) => ({ name: m.name, order: k, value: randomFor(m.name) }))
          }));

          adAccountObj.campaignsData = campaigns as any;
        }

        section.adAccounts.push(adAccountObj);
      }

    }

    reportSections = await this.appendCurrencyToMetrics(reportSections);
    return this.appendPercentForSpecificMetrics(reportSections)
  }

  getMetrics(metrics: string[], customMetrics: AvailableMetricsAdAccountCustomMetric[], customFormulas: AvailableMetricsAdAccountCustomFormula[]): Metric[] {

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
      })).sort((a, b) => a.name.localeCompare(b.name)),
      ...customFormulas.map((formula, index) => ({
        name: formula.name,
        order: index,
        enabled: false,
        isCustom: false,
        isCustomFormula: true,
        customFormulaUuid: formula.uuid
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

      let adAccounts: AdAccountScheduleReportRequest[] = [];

      for (const [adAccountIndex, adAccount] of section.adAccounts.entries()) {

        let metrics: MetricScheduleReportRequest[] = [];
        let customMetrics: CustomMetricScheduleReportRequest[] = [];
        let customFormulas: CustomFormulaScheduleReportRequest[] = [];
        
        for (const metric of adAccount.metrics) {
          if (!metric.enabled) continue;

          if (metric.isCustom) {
            customMetrics.push({
              name: metric.name,
              order: metric.order,
              id: metric.id!
            })
          } else if (metric.isCustomFormula) {
            customFormulas.push({
              name: metric.name,
              order: metric.order,
              uuid: metric.customFormulaUuid!
            })
          } else {
            metrics.push({
              name: metric.name,
              order: metric.order
            })
          }
        }

        if (section.key === 'ads') { // ad_name is obligatory in ads
          const adName = metrics.find(m => m.name === 'ad_name');
          if (!adName) {
            metrics.push({
              name: 'ad_name',
              order: metrics.length
            });
          }
        }

        adAccounts.push({
          adAccountId: adAccount.id,
          adAccountName: adAccount.name,
          order: adAccount.order,
          enabled: adAccount.enabled,
          metrics: metrics,
          customMetrics: customMetrics,
          customFormulas: customFormulas,
          currency: adAccount.currency,
          adsSettings: adAccount.adsSettings,
          campaignsSettings: adAccount.campaignsSettings,
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
          data: c.metrics.map(point => ({
            ...point,
            symbol: shouldAppendPercent(point.name) ? '%' : point.symbol
          }))
        })),
        creativesData: adAccount.creativesData?.map(creative => ({
          ...creative,
          data: creative.metrics.map(metric => ({
            ...metric,
            symbol: shouldAppendPercent(metric.name) ? '%' : metric.symbol
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
            metrics: c.metrics.map(point => this.isCurrencyMetric(point.name)
              ? ({ ...point, currency })
              : point
            )
          }));

          const creativesData = adAccount.creativesData?.map(creative => ({
            ...creative,
            metrics: creative.metrics.map(metric => this.isCurrencyMetric(metric.name)
              ? ({ ...metric, currency })
              : metric
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


  async downloadPdf(reportId: string, pdfFilename: string) {
    this.notificationService.info('Downloading PDF…');
    try {
      const blob = await this.reportService.downloadReportPdf(reportId);
      const url = window.URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    catch(e) {
      this.notificationService.info('Failed to download PDF');
    }

  }

}
