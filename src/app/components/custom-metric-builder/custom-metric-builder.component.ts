import { Component, inject } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MetricsService } from 'src/app/services/metrics.service';
import { Metric } from 'src/app/interfaces/report-sections.interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

type BuilderTokenType = 'metric' | 'operator' | 'paren';

interface BuilderToken {
  type: BuilderTokenType;
  label: string;
  value: string;
}

type CustomMetricFormat = 'number' | 'percentage' | 'currency';

interface CustomMetricBuilderDialogData {
  metrics: Metric[];
  adAccountName: string;
  mode?: 'create' | 'edit';
  initial?: {
    name?: string;
    description?: string;
    format?: CustomMetricFormat;
    formula?: string;
  };
}

export interface CustomMetricBuilderResult {
  name: string;
  description: string;
  format: CustomMetricFormat;
  formula: string;
  mode: 'create' | 'edit';
  delete?: boolean;
}

interface CustomMetricFormatOption {
  label: string;
  value: CustomMetricFormat;
}

@Component({
  selector: 'custom-metric-builder',
  templateUrl: './custom-metric-builder.component.html',
  styleUrl: './custom-metric-builder.component.scss'
})
export class CustomMetricBuilderComponent {

  private readonly dialogRef = inject(MatDialogRef<CustomMetricBuilderComponent>);
  private readonly dialogData = inject(MAT_DIALOG_DATA) as CustomMetricBuilderDialogData;
  public readonly metricsService = inject(MetricsService);

  metrics: Metric[] = this.dialogData.metrics ?? [];
  adAccountName = this.dialogData.adAccountName ?? '';

  private mode: 'create' | 'edit' = this.dialogData.mode ?? 'create';
  private readonly originalName = this.dialogData.initial?.name ?? '';
  actionButtonLabel = this.mode === 'edit' ? 'Update' : 'Save';

  readonly formatOptions: CustomMetricFormatOption[] = [
    { label: 'Number', value: 'number' },
    { label: 'Percentage', value: 'percentage' },
    { label: 'Currency', value: 'currency' },
  ];

  formulaName = '';
  formulaDescription = '';
  selectedFormat: CustomMetricFormat = 'number';
  formulaNameError: string | null = null;

  mathOperations: string[] = ['+', '-', '/', '*', '(', ')'];
  formulaTokens: BuilderToken[] = [];
  formulaDisplay = '';
  errorMessage: string | null = null;

  readonly disallowDrop: (drag: CdkDrag<any>, drop: CdkDropList<any>) => boolean = () => false;
  readonly showDeleteButton = this.mode === 'edit';

  constructor() {
    this.initializeFromDialogData();
  }

  onFormulaDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.formulaTokens, event.previousIndex, event.currentIndex);
    } else {
      const previousId = event.previousContainer.id;

      if (previousId === 'metricsList') {
        const source = event.previousContainer.data as Metric[];
        const metric = source[event.previousIndex];
        if (metric) {
          this.formulaTokens.splice(event.currentIndex, 0, this.createMetricToken(metric));
        }
      }

      if (previousId === 'operationsList') {
        const source = event.previousContainer.data as string[];
        const operation = source[event.previousIndex];
        if (operation) {
          this.formulaTokens.splice(event.currentIndex, 0, this.createOperationToken(operation));
        }
      }
    }

    this.errorMessage = null;
    this.updateFormulaDisplay();
  }

  onMetricClick(metric: Metric): void {
    this.addToken(this.createMetricToken(metric));
  }

  onOperationClick(operation: string): void {
    this.addToken(this.createOperationToken(operation));
  }

  removeToken(index: number): void {
    this.formulaTokens.splice(index, 1);
    this.updateFormulaDisplay();
  }

  clearFormula(): void {
    this.formulaTokens = [];
    this.formulaDisplay = '';
    this.errorMessage = null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(deleteRequested = false): void {
    const trimmedName = this.formulaName.trim();
    const resultName = deleteRequested ? (trimmedName || this.originalName) : trimmedName;

    if (!deleteRequested && !trimmedName) {
      this.formulaNameError = 'Formula name is required.';
      return;
    }

    this.errorMessage = deleteRequested ? null : this.validateTokens();

    if (this.errorMessage) {
      return;
    }

    if (deleteRequested) {
      this.dialogRef.close({
        mode: this.mode,
        delete: true,
        name: resultName,
        description: this.formulaDescription.trim(),
        format: this.selectedFormat,
        formula: this.formulaDisplay,
      } as CustomMetricBuilderResult);
      return;
    }

    const payload: CustomMetricBuilderResult = {
      name: resultName,
      description: this.formulaDescription.trim(),
      format: this.selectedFormat,
      formula: this.formulaDisplay,
      mode: this.mode,
      delete: false,
    };

    this.dialogRef.close(payload);
  }

  onDelete(): void {
    this.onSave(true);
  }

  onNameInput(): void {
    if (this.formulaNameError && this.formulaName.trim()) {
      this.formulaNameError = null;
    }
  }

  private addToken(token: BuilderToken): void {
    this.formulaTokens.push(token);
    this.errorMessage = null;
    this.updateFormulaDisplay();
  }

  private createMetricToken(metric: Metric): BuilderToken {
    return {
      type: 'metric',
      label: this.metricsService.getFormattedMetricName(metric.name),
      // value: metric.name.replaceAll(" ", "_")
      value: metric.isCustom ? "custom_metric_" + metric.id : metric.name
    };
  }

  private createOperationToken(operation: string): BuilderToken {
    const type: BuilderTokenType = operation === '(' || operation === ')' ? 'paren' : 'operator';

    return {
      type,
      label: operation,
      value: operation
    };
  }

  private updateFormulaDisplay(): void {
    this.formulaDisplay = this.formulaTokens.map(token => token.value).join(' ');
  }

  private initializeFromDialogData(): void {
    const initial = this.dialogData.initial;

    if (initial?.name) {
      this.formulaName = initial.name;
    }

    if (typeof initial?.description === 'string') {
      this.formulaDescription = initial.description;
    }

    if (initial?.format) {
      this.selectedFormat = initial.format;
    }

    if (initial?.formula) {
      this.formulaTokens = this.buildTokensFromFormula(initial.formula);
      this.updateFormulaDisplay();
    }
  }

  private buildTokensFromFormula(formula: string): BuilderToken[] {
    const rawTokens = formula.split(/\s+/).filter(Boolean);

    return rawTokens.map(token => this.createTokenFromValue(token));
  }

  private createTokenFromValue(value: string): BuilderToken {
    if (this.isMathOperator(value) || value === '(' || value === ')') {
      return this.createOperationToken(value);
    }

    const metric = this.findMetricByTokenValue(value);
    if (metric) {
      return this.createMetricToken(metric);
    }

    return {
      type: 'metric',
      label: this.metricsService.getFormattedMetricName(value),
      value
    };
  }

  private isMathOperator(value: string): boolean {
    return this.mathOperations.includes(value) && value !== '(' && value !== ')';
  }

  private findMetricByTokenValue(value: string): Metric | undefined {
    return this.metrics.find(metric => {
      if (metric.isCustom) {
        return `custom_metric_${metric.id}` === value;
      }
      return metric.name === value;
    });
  }

  private validateTokens(): string | null {
    if (!this.formulaTokens.length) {
      return 'Formula cannot be empty.';
    }

    let balance = 0;
    let expectOperand = true;
    let metricCount = 0;

    for (const token of this.formulaTokens) {
      if (expectOperand) {
        if (token.type === 'metric') {
          expectOperand = false;
          metricCount += 1;
        } else if (token.type === 'paren' && token.value === '(') {
          balance += 1;
        } else {
          return 'Unexpected operator placement.';
        }
      } else {
        if (token.type === 'operator') {
          expectOperand = true;
        } else if (token.type === 'paren' && token.value === ')') {
          balance -= 1;
          if (balance < 0) {
            return 'Parentheses are not balanced.';
          }
        } else {
          return 'Two operands must be separated by an operator.';
        }
      }
    }

    if (expectOperand) {
      return 'Formula cannot end with an operator.';
    }

    if (balance !== 0) {
      return 'Parentheses are not balanced.';
    }

    if (metricCount === 0) {
      return 'Formula must contain at least one metric.';
    }

    return null;
  }
}
