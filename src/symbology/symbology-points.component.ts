import {Component, Input, Output, EventEmitter} from '@angular/core';

import {SimplePointSymbology, SimpleVectorSymbology} from './symbology.model';
import {CssStringToRgbaPipe} from '../pipes/css-string-to-rgba.pipe';

@Component({
    selector: 'wave-symbology-points',
    template: `
        <table>
            <tr>
                <td>
                    <label>Fill color</label>
                </td>
                <td>
                <md-input-container>
                    <input mdInput
                        class='cc'
                        [style.background-color]='symbology.fillRGBA | rgbaToCssStringPipe'
                        [ngModel]='symbology.fillRGBA | rgbaToCssStringPipe'
                        (ngModelChange)='updateFillRgba($event)'>
                        </md-input-container>
                </td>
            </tr>
            <tr>
                <td>
                    <label>Stroke color</label>
                </td>
                <td>
                <md-input-container>
                    <input mdInput
                        class='cc'
                        [style.background-color]='symbology.strokeRGBA | rgbaToCssStringPipe'
                        [ngModel]='symbology.strokeRGBA | rgbaToCssStringPipe'
                        (ngModelChange)='updateStrokeRgba($event)'>
                    </md-input-container>
                </td>
            </tr>
            <tr>
                <td>
                    <label>Stroke width</label>
                </td>
                <td>
                <md-input-container>
                    <input mdInput type='number' min='0'
                        [(ngModel)]='symbology.strokeWidth'
                        (ngModelChange)='update()'>
                    </md-input-container>
                </td>
            </tr>
            <tr>
                <td><label>Radius</label></td>
                <td>
                <md-input-container>
                    <input mdInput type='number' min='0'
                        [(ngModel)]='symbology.radius'
                        (ngModelChange)='update()'>
                    </md-input-container>
                </td>
            </tr>
        </table>
        `,
    styles: [`
        form {
            padding-top: 16px;
        }
        md-input >>> input {
            color: black !important;
            text-shadow:
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff !important;
        }
        `],
})
export class SymbologyPointsComponent {

    static minStrokeWidth: number = 1;
    static minRadius: number = 1;

    // @Input() layer: Layer;
    @Input() symbology: SimplePointSymbology;
    @Output('symbologyChanged') symbologyChanged = new EventEmitter<SimplePointSymbology>();

    private _cssStringToRgbaTransformer = new CssStringToRgbaPipe();

    update() {
        // console.log('wave-symbology-points', 'update', this.symbology);

        // guard against negative values
        if (this.symbology.radius < SymbologyPointsComponent.minRadius) {
            this.symbology.radius = SymbologyPointsComponent.minRadius;
        }
        if (this.symbology.strokeWidth < SymbologyPointsComponent.minStrokeWidth) {
            this.symbology.strokeWidth = SymbologyPointsComponent.minStrokeWidth;
        }

        // return a clone (immutablility)
        this.symbologyChanged.emit(this.symbology.clone());
    }

    updateFillRgba(rgba: string) {
        if (rgba) {
            this.symbology.fillRGBA = this._cssStringToRgbaTransformer.transform(rgba);
            this.update();
        }
    }

    updateStrokeRgba(rgba: string) {
        if (rgba) {
            this.symbology.strokeRGBA = this._cssStringToRgbaTransformer.transform(rgba);
            this.update();
        }
    }
}

@Component({
    selector: 'wave-symbology-vector',
    template: `
        <table>
            <template [ngIf]='symbology.describesArea()'>
            <tr>
                <td>
                    <label>Fill color</label>
                </td>
                <td>
                <md-input-container>
                    <input mdInput
                        class='cc'
                        [style.background-color]='symbology.fillRGBA | rgbaToCssStringPipe'
                        [ngModel]='symbology.fillRGBA | rgbaToCssStringPipe'
                        (ngModelChange)='updateFillRgba($event)'>
                    </md-input-container>
                </td>
            </tr>
            </template>
            <tr>
                <td>
                    <label>Stroke color</label>
                </td>
                <td>
                <md-input-container>
                    <input mdInput
                        class='cc'
                        [style.background-color]='symbology.strokeRGBA | rgbaToCssStringPipe'
                        [ngModel]='symbology.strokeRGBA | rgbaToCssStringPipe'
                        (ngModelChange)='updateStrokeRgba($event)'>
                    </md-input-container>
                </td>
            </tr>
            <tr>
                <td>
                    <label>Stroke width</label>
                </td>
                <td>
                <md-input-container>
                    <input mdInput type='number' min='0'
                        [(ngModel)]='symbology.strokeWidth'
                        (ngModelChange)='update()'>
                    </md-input-container>
                </td>
            </tr>
        </table>
     `,
    styles: [`
        .mat-input >>> input {
            color: black !important;
            text-shadow:
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff !important;
        }
    `],
})
export class SymbologyVectorComponent {

    static minStrokeWidth: number = 1;

    @Input() symbology: SimpleVectorSymbology;
    @Output('symbologyChanged') symbologyChanged = new EventEmitter<SimpleVectorSymbology>();

    private _cssStringToRgbaTransformer = new CssStringToRgbaPipe();

    update() {
        // console.log('wave-symbology-points', 'update', this.symbology);

        // guard against negative values
        if (this.symbology.strokeWidth < SymbologyPointsComponent.minStrokeWidth) {
            this.symbology.strokeWidth = SymbologyPointsComponent.minStrokeWidth;
        }

        // return a clone (immutablility)
        this.symbologyChanged.emit(this.symbology.clone());
    }

    updateFillRgba(rgba: string) {
        if (rgba) {
            this.symbology.fillRGBA = this._cssStringToRgbaTransformer.transform(rgba);
            this.update();
        }
    }

    updateStrokeRgba(rgba: string) {
        if (rgba) {
            this.symbology.strokeRGBA = this._cssStringToRgbaTransformer.transform(rgba);
            this.update();
        }
    }
}


/* TODO: FIXME:
 [colorPicker]='symbology.fillRGBA | rgbaToCssStringPipe'
 (colorPickerChange)='updateFillRgba($event)'

 [colorPicker]='symbology.strokeRGBA | rgbaToCssStringPipe'
 (colorPickerChange)='updateStrokeRgba($event)'
 [cpOutputFormat]="'rgba'"


 [colorPicker]='symbology.strokeRGBA | rgbaToCssStringPipe'
 (colorPickerChange)='updateStrokeRgba($event)'
 [cpOutputFormat]="'rgba'"

 [colorPicker]='symbology.fillRGBA | rgbaToCssStringPipe'
 (colorPickerChange)='updateFillRgba($event)'
 */
