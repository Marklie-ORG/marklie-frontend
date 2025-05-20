import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationComponent } from '../components/notification/notification.component';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'slide-out';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  notification$ = this.notificationSubject.asObservable();
  private componentRef: ComponentRef<NotificationComponent> | null = null;

  private isVisibleSubject = new BehaviorSubject<boolean>(false);
  isVisible$ = this.isVisibleSubject.asObservable();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  private createComponent(): void {
    if (this.componentRef) {
      return;
    }

    // Create component
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NotificationComponent);
    this.componentRef = componentFactory.create(this.injector);

    // Attach to the appRef so that it's inside the ng component tree
    this.appRef.attachView(this.componentRef.hostView);

    // Get DOM element from component
    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];

    // Append DOM element to the body
    document.body.appendChild(domElem);
  }

  private destroyComponent(): void {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  show(notification: Notification) {
    if (this.isVisibleSubject.getValue()) {
      return;
    }
    this.isVisibleSubject.next(true);
    this.createComponent();
    this.notificationSubject.next(notification);

    if (notification.duration) {
      setTimeout(() => {
        this.hide();
      }, notification.duration);
    }
  }

  hide() {

    if (!this.isVisibleSubject.getValue()) {
      return;
    }

    console.log('hide');

    const domElem = (this.componentRef!.hostView as EmbeddedViewRef<any>).rootNodes[0];

    domElem.querySelector('.notification')?.classList.add('slide-out');

    setTimeout(() => {
      this.notificationSubject.next(null);
      this.destroyComponent();
      this.isVisibleSubject.next(false);
    }, 500);
  }

  success(message: string, duration: number = 3000) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration: number = 3000) {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration: number = 3000) {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration: number = 3000) {
    this.show({ message, type: 'warning', duration });
  }
}
