import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonComponent } from "src/app/components/button/button.component";
import { InputComponent } from "src/app/components/input-new/input.component";

@Component({
  selector: "free-demo-section",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: "./free-demo-section.component.html",
  styleUrls: ["./free-demo-section.component.scss"]
})
export class FreeDemoSectionComponent {
  email = "";
  whatsapp = "";

  //!TODO: add some logic
  onSubmit(): void {}
}
