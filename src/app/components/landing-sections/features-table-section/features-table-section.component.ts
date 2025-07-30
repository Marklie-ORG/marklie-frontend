import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { featuresTableData, FeatureRow } from "./features-table.data";

@Component({
  selector: "features-table-section",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./features-table-section.component.html",
  styleUrls: ["./features-table-section.component.scss"]
})
export class FeaturesTableSectionComponent {
  featuresData: FeatureRow[] = featuresTableData;
}
