import {Component, ViewChild, ElementRef, Input, AfterViewInit, SimpleChange, OnChanges,
        ContentChildren, QueryList, AfterViewChecked, ChangeDetectionStrategy} from "angular2/core";
import ol from "openlayers";
import {OlMapLayerComponent, OlPointLayerComponent, OlRasterLayerComponent} from "./ol-layer.component";

import {Projection, Projections} from "../../models/projection.model";
import {Symbology} from "../../models/symbology.model";

/**
 * The `ol-map` component represents an openLayers 3 map component.
 * it supports `ol-layer` components as child components.
 */
@Component({
    selector: "ol-map",
    template: `
    <div #mapContainer style="background: black;"
         [style.height.px]="height">
    </div>
    <ng-content></ng-content>
    `,
    styleUrls: [
//        "node_modules/openlayers/css/ol.css"
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OlMapComponent implements AfterViewInit, AfterViewChecked, OnChanges {

    private map: ol.Map;

    @ViewChild("mapContainer")
    private mapContainer: ElementRef;

    @Input() projection: Projection;

    /*
    @Input() _width: string | number;
    */

    @Input() height: number;

    @ContentChildren("olLayer")
    private layers: QueryList<OlMapLayerComponent<ol.layer.Layer, ol.source.Source, Symbology>>;

    private isSizeChanged = false;
    private isProjectionChanged = false;

    /**
     * Notify the map that the viewport has resized.
     */
    resize() {
        // will be set to false after view checked event
        this.isSizeChanged = true;
    }

    private createBackgroundLayer(projection: Projection): ol.layer.Image {
        // TODO: more layers
        if (projection === Projections.WEB_MERCATOR) {
            return new ol.layer.Tile({
                source: new ol.source.OSM()
            });
        } else {
            return new ol.layer.Image();
        }
    }

    ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
        // console.log("map changes", changes, this);

        for (let propName in changes) {
            switch (propName) {
                case "height":
                    this.isSizeChanged = true;
                    break;
                case "projection":
                    this.isProjectionChanged = true;
                    break;
            }
        }
    }

    ngAfterViewInit() {
        this.map = new ol.Map({
            target: this.mapContainer.nativeElement,
            layers: [this.createBackgroundLayer(this.projection)],
            view: new ol.View({
                projection: this.projection.getOpenlayersProjection(),
                center: [0, 0],
                zoom: 2
            }),
            controls: [],
            logo: false
        });

        // this.layers.forEach(layer => console.log("added", layer));

        // initialize layers
        this.layers.forEach(
            layerComponent => this.map.addLayer(layerComponent.mapLayer)
        );

        this.layers.changes.subscribe(_ => {
            // react on changes by removing all layers and inserting them
            // in the correct order.

            this.map.getLayers().clear();
            this.map.getLayers().push(this.createBackgroundLayer(this.projection));
            this.layers.forEach(
                layerComponent => this.map.getLayers().push(layerComponent.mapLayer)
            );
        });
    }

    ngAfterViewChecked() {
        if (this.isProjectionChanged) {
            const oldProjection = this.map.getView().getProjection();
            const newProjection = this.projection.getOpenlayersProjection();
            const oldCenterPoint = new ol.geom.Point(this.map.getView().getCenter());
            const newCenterPoint = <ol.geom.Point> oldCenterPoint.clone().transform(
                oldProjection, newProjection
            );

            // console.log(
            //     "oldcenter:", oldCenterPoint.getCoordinates(),
            //     "newcenter:", newCenterPoint.getCoordinates()
            // );

            this.map.setView(new ol.View({
                projection: this.projection.getOpenlayersProjection(),
                center: newCenterPoint.getCoordinates(),
                zoom: this.map.getView().getZoom()
            }));

            this.map.getLayers().clear();
            this.map.getLayers().push(this.createBackgroundLayer(this.projection));
            this.layers.forEach(
                layerComponent => this.map.addLayer(layerComponent.mapLayer)
            );

            this.isProjectionChanged = false;
        }
        if (this.isSizeChanged) {
            this.map.updateSize();
            this.isSizeChanged = false;
        }
    }

    zoomIn() {
        const zoomLevel = this.map.getView().getZoom();
        this.map.getView().setZoom(zoomLevel + 1);
    }

    zoomOut() {
        const zoomLevel = this.map.getView().getZoom();
        this.map.getView().setZoom(zoomLevel - 1);
    }

    zoomToMap() {
        const extent = this.map.getView().getProjection().getExtent();
        this.map.getView().fit(extent, this.map.getSize());
    }

    zoomToLayer(layerIndex: number) {
        const layer = this.layers.toArray()[layerIndex];

        const extent = layer.extent;

        if (extent === undefined) {
            this.zoomToMap();
        } else {
            this.map.getView().fit(
                extent,
                this.map.getSize()
            );
        }
    }

}