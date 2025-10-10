import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef, ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationComponent } from '../components/notification/notification.component';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'slide-out';
  duration?: number;
}

export interface NotificationItem extends Notification {
  id: string;
  isHiding?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private componentRef: ComponentRef<NotificationComponent> | null = null;

  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private timeoutHandles = new Map<string, any>();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  private createComponent(): void {
    if (this.componentRef) {
      return;
    }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NotificationComponent);
    this.componentRef = componentFactory.create(this.injector);

    this.appRef.attachView(this.componentRef.hostView);

    const domElem = (this.componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];

    document.body.appendChild(domElem);
  }

  private destroyComponent(): void {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }

  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private scheduleAutoHide(id: string, duration?: number) {
    if (!duration) return;
    const handle = setTimeout(() => {
      this.hide(id);
    }, duration);
    this.timeoutHandles.set(id, handle);
  }

  show(notification: Notification) {
    this.createComponent();

    const id = this.generateId();
    const item: NotificationItem = { ...notification, id };

    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next([item, ...current]);

    this.scheduleAutoHide(id, notification.duration);
  }

  hide(id: string) {
    const handle = this.timeoutHandles.get(id);
    if (handle) {
      clearTimeout(handle);
      this.timeoutHandles.delete(id);
    }

    const list = this.notificationsSubject.getValue();
    const index = list.findIndex(n => n.id === id);
    if (index === -1) return;

    const updated = [...list];
    if (updated[index].isHiding) return;
    updated[index] = { ...updated[index], isHiding: true };
    this.notificationsSubject.next(updated);

    setTimeout(() => {
      const afterHide = this.notificationsSubject.getValue().filter(n => n.id !== id);
      this.notificationsSubject.next(afterHide);
      if (afterHide.length === 0) {
        this.destroyComponent();
      }
    }, 500);
  }

  info(message: string, duration: number = 3000) {
    this.show({ message, type: 'info', duration });
  }
  
}
