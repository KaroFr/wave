import {LayerDict, UUID, ToDict, ColorizerDict, RgbaColorDict} from '../backend/backend.model';
import {Unit} from '../operators/unit.model';
import {RasterSymbology, Symbology} from './symbology/symbology.model';

export type LayerType = 'raster' | 'vector';

export abstract class Layer implements HasLayerId, HasLayerType, ToDict<LayerDict> {
    abstract readonly layerType: LayerType;

    readonly id: number;

    readonly name: string;
    readonly workflowId: UUID;

    readonly isVisible: boolean;
    readonly isLegendVisible: boolean;

    readonly symbology: Symbology;

    protected static nextLayerId = 0;

    protected constructor(config: {
        id?: number;
        name: string;
        workflowId: string;
        isVisible: boolean;
        isLegendVisible: boolean;
        symbology: Symbology;
    }) {
        this.id = config.id ?? Layer.nextLayerId++;

        this.name = config.name;
        this.workflowId = config.workflowId;
        this.isVisible = config.isVisible;
        this.isLegendVisible = config.isLegendVisible;
        this.symbology = config.symbology;
    }

    /**
     * Create the suitable layer type
     */
    static fromDict(dict: LayerDict): Layer {
        if (dict.symbology.Raster) {
            return RasterLayer.fromDict(dict);
        }

        if (dict.symbology.Vector) {
            return VectorLayer.fromDict(dict);
        }

        throw new Error(`Unknown layer type »${dict}«`);
    }

    // TODO: remove method, here?
    abstract updateFields(changes: {
        id?: number;
        name?: string;
        workflowId?: string;
        isVisible?: boolean;
        isLegendVisible?: boolean;
        symbology?: Symbology;
    }): Layer;

    abstract equals(other: Layer): boolean;

    abstract toDict(): LayerDict;
}

export class VectorLayer extends Layer {
    readonly layerType = 'vector';

    readonly symbology: Symbology;

    constructor(config: {
        id?: number;
        name: string;
        workflowId: string;
        isVisible: boolean;
        isLegendVisible: boolean;
        symbology: Symbology;
    }) {
        super(config);
    }

    static fromDict(dict: LayerDict): Layer {
        return new VectorLayer({
            name: dict.name,
            workflowId: dict.workflow,
            isLegendVisible: dict.visibility.legend,
            isVisible: dict.visibility.data,
            symbology: Symbology.fromDict(dict.symbology),
        });
    }

    toDict(): LayerDict {
        return {
            name: this.name,
            workflow: this.workflowId,
            visibility: {
                data: this.isVisible,
                legend: this.isLegendVisible,
            },
            symbology: this.symbology.toDict(),
        };
    }

    updateFields(changes: {
        id?: number;
        name?: string;
        workflowId?: string;
        isVisible?: boolean;
        isLegendVisible?: boolean;
        symbology?: Symbology;
    }): VectorLayer {
        return new VectorLayer({
            id: changes.id ?? this.id,
            name: changes.name ?? this.name,
            workflowId: changes.workflowId ?? this.workflowId,
            isVisible: changes.isVisible ?? this.isVisible,
            isLegendVisible: changes.isLegendVisible ?? this.isLegendVisible,
            symbology: changes.symbology ?? this.symbology,
        });
    }

    equals(other: Layer): boolean {
        if (!(other instanceof VectorLayer)) {
            return false;
        }

        return (
            this.id === other.id &&
            this.name === other.name &&
            this.workflowId === other.workflowId &&
            this.isVisible === other.isVisible &&
            this.isLegendVisible === other.isLegendVisible &&
            this.symbology === other.symbology
        );
    }
}

export class RasterLayer extends Layer {
    readonly layerType = 'raster';

    readonly symbology: RasterSymbology;

    constructor(config: {
        id?: number;
        name: string;
        workflowId: string;
        isVisible: boolean;
        isLegendVisible: boolean;
        symbology: Symbology;
    }) {
        super(config);
    }

    static fromDict(dict: LayerDict): Layer {
        return new RasterLayer({
            name: dict.name,
            isLegendVisible: dict.visibility.legend,
            isVisible: dict.visibility.data,
            workflowId: dict.workflow,
            symbology: RasterSymbology.fromRasterSymbologyDict(dict.symbology.Raster),
        });
    }

    updateFields(changes: {
        id?: number;
        name?: string;
        workflowId?: string;
        isVisible?: boolean;
        isLegendVisible?: boolean;
        symbology?: RasterSymbology;
    }): RasterLayer {
        return new RasterLayer({
            id: changes.id ?? this.id,
            name: changes.name ?? this.name,
            workflowId: changes.workflowId ?? this.workflowId,
            isVisible: changes.isVisible ?? this.isVisible,
            isLegendVisible: changes.isLegendVisible ?? this.isLegendVisible,
            symbology: changes.symbology ?? this.symbology,
        });
    }

    equals(other: Layer): boolean {
        if (!(other instanceof RasterLayer)) {
            return false;
        }

        return (
            this.id === other.id &&
            this.name === other.name &&
            this.workflowId === other.workflowId &&
            this.isVisible === other.isVisible &&
            this.isLegendVisible === other.isLegendVisible &&
            this.symbology === other.symbology
        );
    }

    toDict(): LayerDict {
        return {
            name: this.name,
            workflow: this.workflowId,
            visibility: {
                data: this.isVisible,
                legend: this.isLegendVisible,
            },
            symbology: this.symbology.toDict(),
        };
    }
}

export interface HasLayerId {
    readonly id: number;
}

export interface HasLayerType {
    readonly layerType: LayerType;
}
