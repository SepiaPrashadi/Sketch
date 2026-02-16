import { Component, ElementRef, input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

declare var p5: any;

@Component({
    selector: 'app-p5-sketch',
    template: '<div></div>',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class P5SketchComponent implements OnInit, OnDestroy {
    sketch = input.required<(p: any) => void>();
    width = input.required<number>();
    height = input.required<number>();
    private p5Instance: any;

    constructor(private elementRef: ElementRef) {}

    ngOnInit() {
        const sketchFunc = this.sketch();
        const w = this.width();
        const h = this.height();

        const wrappedSketch = (p: any) => {
            sketchFunc(p);
            const originalSetup = p.setup;
            p.setup = () => {
                p.createCanvas(w, h);
                if (originalSetup) originalSetup();
            };
        };

        this.p5Instance = new p5(wrappedSketch, this.elementRef.nativeElement);
    }

    ngOnDestroy() {
        if (this.p5Instance) {
            this.p5Instance.remove();
        }
    }
}