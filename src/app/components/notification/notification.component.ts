import { Component, OnInit, OnDestroy, ElementRef, NgZone, QueryList, ViewChildren } from '@angular/core';
import { NotificationService, NotificationItem } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  private subscription: Subscription;

  @ViewChildren('item', { read: ElementRef }) itemElements!: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {
    this.subscription = this.notificationService.notifications$.subscribe(
      nextNotifications => {
        const prevPositions = this.getPositionsMap();
        const prevIds = new Set(this.notifications.map(n => n.id));
        const enteringIds = new Set(nextNotifications.filter(n => !prevIds.has(n.id)).map(n => n.id));

        this.ngZone.runOutsideAngular(() => {
          Promise.resolve().then(() => {
            this.ngZone.run(() => {
              this.notifications = nextNotifications;
            });

            requestAnimationFrame(() => {
              const newPositions = this.getPositionsMap();
              this.itemElements.forEach(elRef => {
                const el = elRef.nativeElement;
                const id = el.getAttribute('data-id') || '';
                if (enteringIds.has(id)) {
                  return;
                }
                const prevTop = prevPositions.get(id);
                const newTop = newPositions.get(id);
                if (prevTop == null || newTop == null) return;
                const deltaY = prevTop - newTop;
                if (deltaY !== 0) {
                  el.style.transition = 'none';
                  el.style.transform = `translateY(${deltaY}px)`;
                  void el.getBoundingClientRect();
                  el.style.transition = 'transform 600ms ease-in-out';
                  el.style.transform = '';
                  setTimeout(() => {
                    el.style.transition = '';
                  }, 650);
                }
              });
            });
          });
        });
      }
    );
  }

  private getPositionsMap(): Map<string, number> {
    const map = new Map<string, number>();
    if (!this.itemElements) return map;
    this.itemElements.forEach(elRef => {
      const el = elRef.nativeElement;
      const id = el.getAttribute('data-id') || '';
      if (!id) return;
      map.set(id, el.getBoundingClientRect().top);
    });
    return map;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  close(id: string): void {
    this.notificationService.hide(id);
  }
}
