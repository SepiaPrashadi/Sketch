import { Component, computed, ChangeDetectionStrategy, inject, signal, HostListener, OnInit, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface ArtSketch {
  id: string;
  url: string;
  width: number;
  height: number;
  title: string;
  gridClass: string;
  mobileGridClass?: string; 
  offset: number;
  isEmpty?: boolean;
  isText?: boolean;
  customMetadata?: string;
  hideMetadata?: boolean;
}

type FilterRatio = 'ALL' | 'SQUARE' | 'LANDSCAPE';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [`
    :host { display: block; }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    
    .fixed-top-left {
      position: absolute !important;
      top: -24px !important;
      left: -8px !important;
      z-index: 50;
    }

    @media (min-width: 768px) {
      .fixed-top-left {
        left: -48px !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit, AfterViewInit {
  private sanitizer = inject(DomSanitizer);
  
  // Using viewChild signal for Angular 17+
  mainContainer = viewChild<ElementRef<HTMLElement>>('mainContainer');

  readonly navbarOffset = 42;
  windowWidth = signal(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // Initialize with 0 to prevent initial overshoot
  totalHeight = signal(0); 
  pathTrigger = signal(0); 
  
  // Filter Signals
  filterRatio = signal<FilterRatio>('ALL');

  isMobile = computed(() => this.windowWidth() <= 768);

  sketches = signal<ArtSketch[]>([
    { id: 'a', title: 'То ся зробить!', url: '', width: 800, height: 800, gridClass: 'md:col-span-1', mobileGridClass: 'col-span-2', offset: 0, isText: true },
    { id: 'gap-b', title: '', url: '', width: 0, height: 0, gridClass: 'md:col-span-2', offset: 0, isEmpty: true },
    { id: 'b', title: 'Повози мишкою ↓', url: 'https://editor.p5js.org/AnnaUsername/full/mUYkc5cng', width: 1216, height: 600, gridClass: 'md:col-span-2', mobileGridClass: 'col-span-2 col-start-3', offset: 40, hideMetadata: true },
    { id: 'c-gap', title: '', url: '', width: 0, height: 0, gridClass: 'md:col-span-1', offset: 0, isEmpty: true },
    { id: 'c', title: '', url: 'https://editor.p5js.org/AnnaUsername/full/5q7hxjBF5', width: 800, height: 800, gridClass: 'md:col-span-1', mobileGridClass: 'col-span-3 col-start-2', offset: 20, hideMetadata: true },
    { id: 'e', title: 'Поклацай ↓', url: 'https://editor.p5js.org/AnnaUsername/full/pW7bUsOOv', width: 1800, height: 800, gridClass: 'md:col-span-3', mobileGridClass: 'col-span-4', offset: 60, hideMetadata: true },
    { id: 'spacer-row-e', title: '', url: '', width: 0, height: 0, gridClass: 'md:col-span-1', offset: 0, isEmpty: true },
    { id: 'gap-h', title: '', url: '', width: 0, height: 0, gridClass: 'md:col-span-2', offset: 0, isEmpty: true },
    { id: 'h', title: '', url: 'https://editor.p5js.org/AnnaUsername/full/lQeJceQ95', width: 1000, height: 900, gridClass: 'md:col-span-2', mobileGridClass: 'col-span-3', offset: 30, hideMetadata: true },
    { id: 'gap-g', title: '', url: '', width: 0, height: 0, gridClass: 'md:col-span-1', offset: 0, isEmpty: true },
    { id: 'g', title: 'Потягай слайдер ↓', url: 'https://editor.p5js.org/AnnaUsername/full/l5ovERe5T', width: 1480, height: 900, gridClass: 'md:col-span-3', mobileGridClass: 'col-span-4', offset: 40, hideMetadata: true },
    { id: 'f', title: '', url: 'https://editor.p5js.org/AnnaUsername/full/T0eelPoTz', width: 2500, height: 1200, gridClass: 'md:col-span-3', mobileGridClass: 'col-span-4', offset: -30, hideMetadata: true }
  ]);

  // Derived state: Are we currently filtering?
  isFiltering = computed(() => this.filterRatio() !== 'ALL');

  // Filter the raw sketches before layout calculation
  filteredSketches = computed(() => {
    const all = this.sketches();
    const ratio = this.filterRatio();
    const active = this.isFiltering();

    return all.filter(item => {
      // 0. Identity/Text items are exempt from all filters and always remain visible
      if (item.isText) return true;

      // 1. If filtering is active, remove empty spacers to pack grid
      if (active && item.isEmpty) return false;

      // 2. Filter by Aspect Ratio
      if (ratio !== 'ALL' && !item.isEmpty) {
        if (ratio === 'SQUARE' && item.width !== item.height) return false;
        if (ratio === 'LANDSCAPE' && item.width <= item.height) return false;
      }

      return true;
    });
  });

  galleryItems = computed(() => {
    const winWidth = this.windowWidth();
    const isMob = winWidth <= 768;
    const gap = isMob ? 16 : 32; 
    const padding = isMob ? 32 : 96; 
    const availableWidth = Math.max(0, winWidth - padding);
    
    const totalCols = 4; 
    const unit = (availableWidth - (gap * (totalCols - 1))) / totalCols;
    const filtering = this.isFiltering();

    return this.filteredSketches().map(sketch => {
      if (sketch.isEmpty) return { ...sketch, scale: 1, displayWidth: 0, displayHeight: 0, safeUrl: '' as SafeResourceUrl, displayOffset: 0, nativeWidth: 0, nativeHeight: 0 };
      
      const gridClass = isMob ? (sketch.mobileGridClass || 'col-span-4') : sketch.gridClass;
      const spanString = gridClass.match(/col-span-(\d+)/)?.[1];
      const span = spanString ? parseInt(spanString, 10) : 1;
      
      const targetWidth = (unit * span) + (gap * (span - 1));
      const scale = targetWidth < sketch.width ? targetWidth / sketch.width : 1;

      let displayHeight = sketch.height * scale;
      if (isMob && sketch.id === 'a') {
        displayHeight = targetWidth / 2;
      }
      
      // If filtering, disable vertical offsets to pack tight
      const displayOffset = filtering ? 0 : ((isMob && sketch.id === 'a') ? 24 : (isMob ? 0 : sketch.offset));

      return {
        ...sketch,
        scale,
        nativeWidth: sketch.width,
        nativeHeight: sketch.height,
        displayWidth: targetWidth,
        displayHeight: displayHeight,
        displayOffset,
        safeUrl: sketch.url ? this.sanitizer.bypassSecurityTrustResourceUrl(sketch.url.replace('/full/', '/present/')) : ('' as SafeResourceUrl)
      };
    });
  });

  pathPoints = computed(() => {
    // Hide path if filtering is active (narrative is broken)
    if (this.isFiltering()) return '';

    // Explicitly watch these signals
    this.pathTrigger(); 
    this.totalHeight();
    const winWidth = this.windowWidth();

    const isMob = winWidth <= 768;
    const padding = isMob ? 32 : 96;
    const gap = isMob ? 16 : 32;
    const availableWidth = Math.max(0, winWidth - padding);
    const unit = (availableWidth - (gap * 3)) / 4;

    const col1 = 0;
    const col2 = ((unit + gap) / availableWidth) * 100;
    const col3 = (((unit + gap) * 2) / availableWidth) * 100;
    const col4 = (((unit + gap) * 3) / availableWidth) * 100;
    const colRight = 100;

    const pathLayout = [
      { id: 'a', x: col1, align: 'center' },      
      { id: 'b', x: isMob ? col3 : col4, align: 'center' },      
      { id: 'e', x: col2, align: 'center' },      
      { id: 'e', x: colRight, align: 'bottom' },  
      { id: 'g', x: col1, align: 'center' },      
      { id: 'f', x: col3, align: 'center' }       
    ];

    return pathLayout.map(point => {
      // Safety check for document
      if (typeof document === 'undefined') return '0,0';
      
      const element = document.getElementById('node-' + point.id);
      if (!element) {
        return `0,0`;
      }
      
      const rect = element.getBoundingClientRect();
      const parentRect = element.parentElement?.getBoundingClientRect() || { top: 0 };
      
      let yOffset = rect.height / 2;
      if (point.align === 'bottom') {
        yOffset = rect.height; 
      }
      
      const y = (rect.top - parentRect.top) + yOffset + 20; 
      return `${point.x},${y}`;
    }).join(' ');
  });

  setFilterRatio(ratio: FilterRatio) {
    this.filterRatio.set(ratio);
    setTimeout(() => this.updateHeight(), 50);
  }

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
    this.updateHeight();
    this.pathTrigger.update(v => v + 1);
  }

  scrollToSection(elementId: string): void {
    if (typeof document === 'undefined') return;
    
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private updateHeight() {
    const el = this.mainContainer()?.nativeElement;
    if (el) {
      const newHeight = el.offsetHeight;
      this.totalHeight.set(newHeight);
      this.pathTrigger.update(v => v + 1);
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.windowWidth.set(window.innerWidth);
    }
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      const observer = new ResizeObserver(() => {
        this.updateHeight();
      });
      
      const el = this.mainContainer()?.nativeElement;
      if (el) {
        observer.observe(el);
        this.updateHeight();
      }

      setTimeout(() => this.updateHeight(), 100);
      setTimeout(() => this.updateHeight(), 500);
      setTimeout(() => this.updateHeight(), 1500);
    }
  }
}