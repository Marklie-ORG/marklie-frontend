import { Component } from '@angular/core';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'landing-hero-section',
  templateUrl: './landing-hero-section.component.html',
  styleUrls: ['./landing-hero-section.component.scss'],
})
export class LandingHeroSectionComponent {
  faArrowRight = faArrowRight;
}
