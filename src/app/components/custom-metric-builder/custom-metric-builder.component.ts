import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MetricsService } from 'src/app/services/metrics.service';
import { Metric } from 'src/app/interfaces/report-sections.interfaces';

type BuilderTokenType = 'metric' | 'operator' | 'paren';

interface BuilderToken {
  type: BuilderTokenType;
  label: string;
  value: string;
}

@Component({
  selector: 'custom-metric-builder',
  templateUrl: './custom-metric-builder.component.html',
  styleUrl: './custom-metric-builder.component.scss'
})
export class CustomMetricBuilderComponent {
  @Input() metrics: Metric[] = [];
  @Input() adAccountName = '';

  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();

  mathOperations: string[] = ['+', '-', '/', '*', '(', ')'];
  formulaTokens: BuilderToken[] = [];
  formulaDisplay = '';
  errorMessage: string | null = null;

  readonly disallowDrop: (drag: CdkDrag<any>, drop: CdkDropList<any>) => boolean = () => false;

  constructor(public metricsService: MetricsService) {}

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
    this.cancel.emit();
  }

  onSave(): void {
    this.errorMessage = this.validateTokens();

    if (this.errorMessage) {
      return;
    }

    this.save.emit(this.formulaDisplay);
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
    console.log('this.formulaTokens', this.formulaTokens);
    this.formulaDisplay = this.formulaTokens.map(token => token.value).join(' ');
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
