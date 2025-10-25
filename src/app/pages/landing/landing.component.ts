import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {AuthDialogComponent} from "../../components/auth-dialog/auth-dialog.component.js";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

  constructor() {}

  headline: string = 'Set up automated Facebook reports.<br>Save time, increase client retention.';

  subheadline: string = 'Connect your Facebook, set up once, and we handle the rest.<br>Clients love regular updates — we make it automatic.';

}
