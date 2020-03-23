import {Interpolation, Unit, UnitDict} from '../../operators/unit.model';
import {Color, RgbaLike, RgbaTuple, TRANSPARENT, WHITE} from '../../colors/color';
import {ColorizerData, IColorizerData, MappingRasterColorizerDict} from '../../colors/colorizer-data.model';
import {ColorBreakpoint, ColorBreakpointDict} from '../../colors/color-breakpoint.model';
import {Colormap} from '../../colors/colormaps/colormap.model';

export enum SymbologyType {
    RASTER,
    SIMPLE_POINT,
    CLUSTERED_POINT,
    SIMPLE_LINE,
    SIMPLE_VECTOR,
    MAPPING_COLORIZER_RASTER,
    ICON_POINT, // RESERVED
    COMPLEX_POINT,
    COMPLEX_VECTOR,
    COMPLEX_LINE
}

export const DEFAULT_VECTOR_STROKE_COLOR: Color = Color.fromRgbaLike([0, 0, 0, 1]);
export const DEFAULT_VECTOR_FILL_COLOR: Color = Color.fromRgbaLike([255, 0, 0, 1]);
export const DEFAULT_VECTOR_HIGHLIGHT_STROKE_COLOR: Color = Color.fromRgbaLike([255, 255, 255, 1]);
export const DEFAULT_VECTOR_HIGHLIGHT_FILL_COLOR: Color = Color.fromRgbaLike([0, 153, 255, 1]);
export const DEFAULT_VECTOR_HIGHLIGHT_TEXT_COLOR: Color = Color.fromRgbaLike([255, 255, 255, 1]);
export const DEFAULT_POINT_RADIUS = 5;
export const DEFAULT_POINT_CLUSTER_RADIUS_ATTRIBUTE = '___radius';
export const DEFAULT_POINT_CLUSTER_TEXT_ATTRIBUTE = '___numberOfPoints';
export const MIN_ALLOWED_POINT_RADIUS = 1;
export const MAX_ALLOWED_POINT_RADIUS = 100;
export const MAX_ALLOWED_TEXT_LENGTH = 25;

/**
 * Serialization interface
 */
export interface SymbologyDict {
    symbologyType: string;
}

// tslint:disable-next-line: no-empty-interface
export interface ISymbology {
}

export type StrokeDashStyle = Array<number>;

// TODO: Clean up...
export abstract class AbstractSymbology implements ISymbology {

    static fromDict(
        dict: SymbologyDict
    ): AbstractSymbology {
        switch (dict.symbologyType) {
            case SymbologyType[SymbologyType.SIMPLE_POINT]:
            case SymbologyType[SymbologyType.COMPLEX_POINT]:
                return PointSymbology.createSymbology(dict as PointSymbologyDict);

            case SymbologyType[SymbologyType.CLUSTERED_POINT]:
                return PointSymbology.createClusterSymbology(dict as VectorSymbologyDict);

            case SymbologyType[SymbologyType.SIMPLE_LINE]:
            case SymbologyType[SymbologyType.COMPLEX_LINE]:
                return LineSymbology.createSymbology(dict as VectorSymbologyDict);

            case SymbologyType[SymbologyType.SIMPLE_VECTOR]:
            case SymbologyType[SymbologyType.COMPLEX_VECTOR]:
                return VectorSymbology.createSymbology(dict as VectorSymbologyDict);

            case SymbologyType[SymbologyType.RASTER]:
            case SymbologyType[SymbologyType.MAPPING_COLORIZER_RASTER]:
                return MappingRasterSymbology.createSymbology(dict as RasterSymbologyDict);
            default:
                throw new Error('Unsupported AbstractSymbology');
        }
    }

    abstract getSymbologyType(): SymbologyType;

    get symbologyType(): SymbologyType {
        return this.getSymbologyType();
    }

    get symbologyTypeId(): string {
        return SymbologyType[this.getSymbologyType()];
    }

    abstract clone(): AbstractSymbology;

    abstract toConfig(): ISymbology;

    abstract equals(other: AbstractSymbology): boolean;

    abstract toDict(): SymbologyDict;
}

export interface VectorSymbologyConfig extends ISymbology {
    fillRGBA?: RgbaLike;
    strokeRGBA?: RgbaLike;
    strokeWidth?: number;
    fillColorizer?: IColorizerData;
    fillColorAttribute?: string;
    strokeColorizer?: IColorizerData;
    strokeColorAttribute?: string;
    strokeDashStyle?: StrokeDashStyle;
    textAttribute?: string;
    textColor?: RgbaLike;
    textStrokeWidth?: number;
}

interface VectorSymbologyDict extends SymbologyDict {
    fillRGBA: RgbaTuple;
    strokeRGBA: RgbaTuple;
    strokeWidth: number;
    fillColorizer: IColorizerData;
    fillColorAttribute: string;
    strokeColorizer: IColorizerData;
    strokeColorAttribute: string;
    strokeDashStyle: StrokeDashStyle;
    textAttribute: string;
    textColor: RgbaLike;
    textStrokeWidth: number;
}

export abstract class AbstractVectorSymbology extends AbstractSymbology {
    _fillColorBreakpoint: ColorBreakpoint = new ColorBreakpoint({rgba: DEFAULT_VECTOR_FILL_COLOR, value: 'Default fill color'});
    _strokeColorBreakpoint: ColorBreakpoint = new ColorBreakpoint({rgba: DEFAULT_VECTOR_STROKE_COLOR, value: 'Default stroke color'});
    strokeWidth = 1;

    fillColorizer: ColorizerData;
    fillColorAttribute: string = undefined;
    strokeColorizer: ColorizerData;
    strokeColorAttribute: string = undefined;
    strokeDashStyle: StrokeDashStyle = undefined;
    textAttribute: string = undefined;
    textColor: Color = undefined;
    textStrokeWidth: number = undefined;

    abstract describesElementFill(): boolean;

    abstract describesElementStroke(): boolean;

    abstract describesPointsWithRadius(): boolean;

    public get symbologyIconName(): string {
        switch (this.getSymbologyType()) {
            case SymbologyType.SIMPLE_POINT:
            case SymbologyType.COMPLEX_POINT:
                return 'symbology:point';
            case SymbologyType.SIMPLE_LINE:
            case SymbologyType.COMPLEX_LINE:
                return 'symbology:line';
            case SymbologyType.SIMPLE_VECTOR:
            case SymbologyType.COMPLEX_VECTOR:
                return 'symbology:polygon';
            default:
                throw new Error(`No symbology icon name defined for ${this.symbologyType}`);
        }
    }

    // Wrap colors in ColorBreakpoint for easy form usage
    set fillColorBreakpoint(colorBreakpoint: ColorBreakpoint) {
        this._fillColorBreakpoint = colorBreakpoint;
    }

    get fillColorBreakpoint(): ColorBreakpoint {
        return this._fillColorBreakpoint;
    }

    set strokeColorBreakpoint(colorBreakpoint: ColorBreakpoint) {
        this._strokeColorBreakpoint = colorBreakpoint;
    }

    get strokeColorBreakpoint(): ColorBreakpoint {
        return this._strokeColorBreakpoint;
    }

    // Wrap colors in ColorBreakpoint for easy form usage
    set fillRGBA(color: Color) {
        this._fillColorBreakpoint.setColor(color);
    }

    get fillRGBA(): Color {
        return this._fillColorBreakpoint.rgba;
    }

    set strokeRGBA(color: Color) {
        this._strokeColorBreakpoint.setColor(color);
    }

    get strokeRGBA(): Color {
        return this._strokeColorBreakpoint.rgba;
    }

    equals(other: AbstractVectorSymbology) {
        if (other instanceof AbstractVectorSymbology) {
            return this.fillColorBreakpoint.equals(other.fillColorBreakpoint)
                && this.strokeColorBreakpoint.equals(other.strokeColorBreakpoint)
                && this.strokeWidth === other.strokeWidth
                && this.describesElementFill() === other.describesElementFill()
                && this.describesPointsWithRadius() === other.describesPointsWithRadius()
                && this.fillColorizer && this.fillColorizer.equals(other.fillColorizer)
                && this.fillColorAttribute && other.fillColorAttribute && this.fillColorAttribute === other.fillColorAttribute
                && this.strokeColorizer && this.strokeColorizer.equals(other.strokeColorizer)
                && this.strokeColorAttribute && other.strokeColorAttribute && this.strokeColorAttribute === other.strokeColorAttribute
                && this.strokeDashStyle && other.strokeDashStyle && this.strokeDashStyle === other.strokeDashStyle
                && this.textColor && this.textColor.equals(other.textColor)
                && this.textStrokeWidth && other.textStrokeWidth && this.textStrokeWidth === other.textStrokeWidth
                && this.textAttribute && other.textAttribute && this.textAttribute === other.textAttribute;
        }
        return false;
    }

    setFillColorBreakpoint(colorBreakpoint: ColorBreakpoint) {
            this.fillColorBreakpoint = colorBreakpoint;
    }

    setStrokeColorBreakpoint(colorBreakpoint: ColorBreakpoint) {
            this.strokeColorBreakpoint = colorBreakpoint;
    }

    protected constructor(config: VectorSymbologyConfig) {
        super();
        if (config.fillRGBA) {
            this.fillRGBA = Color.fromRgbaLike(config.fillRGBA);
        }
        if (config.strokeRGBA) {
            this.strokeRGBA = Color.fromRgbaLike(config.strokeRGBA);
        }
        if (config.strokeWidth) {
            this.strokeWidth = config.strokeWidth;
        }

        if (config.fillColorAttribute) {
            this.fillColorAttribute = config.fillColorAttribute;
        }
        this.fillColorizer = (config.fillColorizer) ? ColorizerData.fromDict(config.fillColorizer) : ColorizerData.empty();

        if (config.strokeColorAttribute) {
            this.strokeColorAttribute = config.strokeColorAttribute;
        }
        this.strokeColorizer = (config.strokeColorizer) ? ColorizerData.fromDict(config.strokeColorizer) : ColorizerData.empty();

        if (config.strokeDashStyle) {
            this.strokeDashStyle = config.strokeDashStyle;
        }

        if (config.textAttribute) {
            this.textAttribute = config.textAttribute;
        }
        this.textColor = config.textColor ? Color.fromRgbaLike(config.textColor) : WHITE;
        this.textStrokeWidth = config.textStrokeWidth ? config.textStrokeWidth : Math.ceil(config.strokeWidth * 0.1);
    }

    setFillColorAttribute(name: string, clr: ColorizerData = ColorizerData.empty()) {
        this.fillColorizer = clr;
        this.fillColorAttribute = name;
    }

    setOrUpdateFillColorizer(clr: ColorizerData): boolean {
        if (clr && (!this.fillColorizer || !clr.equals(this.fillColorizer))) {
            this.fillColorizer = clr;
            return true;
        }
        return false;
    }

    unSetFillColorAttribute() {
        this.fillColorAttribute = undefined;
        this.fillColorizer = ColorizerData.empty();
    }

    setStrokeColorAttribute(name: string, clr: ColorizerData = ColorizerData.empty()) {
        this.strokeColorizer = clr;
        this.strokeColorAttribute = name;
    }

    setOrUpdateStrokeColorizer(clr: ColorizerData): boolean {
        if (clr && (!this.strokeColorizer || !clr.equals(this.strokeColorizer))) {
            this.strokeColorizer = clr;
            return true;
        }
        return false;
    }

    unSetStrokeColorAttribute() {
        this.strokeColorAttribute = undefined;
        this.strokeColorizer = ColorizerData.empty();
    }

    setStrokeDashStyle(strokeDashStyle: StrokeDashStyle) {
        this.strokeDashStyle = strokeDashStyle;
    }

    unSetStrokeDashStyle() {
        this.strokeDashStyle = undefined;
    }

    setTextAttribute(textAttribute: string) {
        this.textAttribute = textAttribute;
    }

    unSetTextAttribute() {
        this.textAttribute = undefined;
    }

    toDict(): VectorSymbologyDict {
        return {
            symbologyType: SymbologyType[this.getSymbologyType()],
            fillRGBA: this.fillRGBA.rgbaTuple(),
            strokeRGBA: this.strokeRGBA.rgbaTuple(),
            strokeWidth: this.strokeWidth,
            fillColorAttribute: this.fillColorAttribute,
            fillColorizer: this.fillColorizer ? this.fillColorizer.toDict() : undefined,
            strokeColorAttribute: this.strokeColorAttribute,
            strokeColorizer: this.strokeColorizer,
            strokeDashStyle: this.strokeDashStyle,
            textAttribute: this.textAttribute,
            textColor: this.textColor.rgbaTuple(),
            textStrokeWidth: this.textStrokeWidth,
        };
    }
}

export interface PointSymbologyConfig extends VectorSymbologyConfig {
    radius?: number;
    radiusAttribute?: string;
    radiusFactor?: number;
    clustered?: boolean;
}

interface PointSymbologyDict extends VectorSymbologyDict {
    radius: number;
    radiusAttribute: string;
    radiusFactor: number;
    clustered: boolean;
}

export class LineSymbology extends AbstractVectorSymbology implements VectorSymbologyConfig {
    protected constructor(config: VectorSymbologyConfig) {
        super(config);
    }

    static createSymbology(config: VectorSymbologyConfig): LineSymbology {
        return new LineSymbology(config);
    }

    describesElementStroke(): boolean {
        return true;
    }

    describesElementFill(): boolean {
        return false;
    }

    describesPointsWithRadius(): boolean {
        return false;
    }

    getSymbologyType(): SymbologyType {
        return SymbologyType.COMPLEX_LINE;
    }

    clone(): LineSymbology {
        return new LineSymbology(this);
    }

    toConfig(): LineSymbology {
        return this.clone();
    }
}

export class VectorSymbology extends AbstractVectorSymbology implements VectorSymbologyConfig {

    protected constructor(config: VectorSymbologyConfig) {
        super(config);
    }

    static createSymbology(config: VectorSymbologyConfig): VectorSymbology {
        return new VectorSymbology(config);
    }

    describesElementStroke(): boolean {
        return true;
    }

    describesElementFill(): boolean {
        return true;
    }

    describesPointsWithRadius(): boolean {
        return false;
    }

    getSymbologyType(): SymbologyType {
        return SymbologyType.COMPLEX_VECTOR;
    }

    clone(): VectorSymbology {
        return new VectorSymbology(this);
    }

    toConfig(): VectorSymbologyConfig {
        return this.clone();
    }
}

export class PointSymbology extends AbstractVectorSymbology implements PointSymbologyConfig {

    radiusAttribute: string = undefined;
    radiusFactor = 1.0;
    radius: number = DEFAULT_POINT_RADIUS;
    clustered = false;

    protected constructor(config: PointSymbologyConfig) {
        super(config);

        if (config.radius) {
            this.radius = config.radius;
        }

        if (config.radiusAttribute) {
            this.radiusAttribute = config.radiusAttribute;
        }
        this.clustered = (config.clustered) ? config.clustered : false;
        this.radiusFactor = (config.radiusFactor) ? config.radiusFactor : 1.0;
    }

    /**
     * Creates a ComplexPointSymbology where radiusAttribute and textAttribute are set to the strings returned by Mappings cluster operator
     */
    static createClusterSymbology(config: PointSymbologyConfig): PointSymbology {
        config.radiusAttribute = DEFAULT_POINT_CLUSTER_RADIUS_ATTRIBUTE;
        config.textAttribute = DEFAULT_POINT_CLUSTER_TEXT_ATTRIBUTE;
        config.clustered = true;

        return PointSymbology.createSymbology(config);
    }

    static createSymbology(config: PointSymbologyConfig): PointSymbology {
        return new PointSymbology(config);
    }

    getSymbologyType(): SymbologyType {
        return SymbologyType.COMPLEX_POINT;
    }

    clone(): PointSymbology {
        return new PointSymbology(this);
    }

    equals(other: AbstractVectorSymbology) {
        if (other instanceof PointSymbology) {
            return super.equals(other as AbstractVectorSymbology)
                && this.radiusAttribute && other.radiusAttribute && this.radiusAttribute === other.radiusAttribute;
        }
        return false;
    }

    toConfig(): PointSymbologyConfig {
        return this.clone();
    }

    describesElementStroke(): boolean {
        return true;
    }

    describesElementFill(): boolean {
        return true;
    }

    describesPointsWithRadius(): boolean {
        return true;
    }

    setRadiusAttribute(name: string, factor = 1.0) {
        this.radiusAttribute = name;
        this.radiusFactor = factor;
    }

    unSetRadiusAttribute() {
        this.radiusAttribute = undefined;
        this.radiusFactor = 1.0;
    }

    toDict(): PointSymbologyDict {
        return {
            symbologyType: SymbologyType[SymbologyType.COMPLEX_POINT],
            fillRGBA: this.fillRGBA.rgbaTuple(),
            strokeRGBA: this.strokeRGBA.rgbaTuple(),
            strokeWidth: this.strokeWidth,
            fillColorAttribute: this.fillColorAttribute,
            fillColorizer: this.fillColorizer ? this.fillColorizer.toDict() : undefined,
            strokeColorAttribute: this.strokeColorAttribute,
            strokeColorizer: this.strokeColorizer,
            strokeDashStyle: this.strokeDashStyle,
            radiusAttribute: this.radiusAttribute,
            radiusFactor: this.radiusFactor,
            radius: this.radius,
            textAttribute: this.textAttribute,
            textColor: this.textColor.rgbaTuple(),
            textStrokeWidth: this.textStrokeWidth,
            clustered: this.clustered,
        };
    }
}

export interface IRasterSymbology extends ISymbology {
    opacity?: number;
    unit: Unit | UnitDict;
}

export interface RasterSymbologyDict extends SymbologyDict {
    opacity: number;
    unit: UnitDict;
    colorizer?: IColorizerData;
    noDataColor?: ColorBreakpointDict;
    overflowColor?: ColorBreakpointDict;
}

export interface IColorizerRasterSymbology extends IRasterSymbology {
    colorizer?: IColorizerData;
    noDataColor?: ColorBreakpointDict;
    overflowColor?: ColorBreakpointDict;
}

export abstract class AbstractRasterSymbology extends AbstractSymbology implements IRasterSymbology {
    opacity = 1;
    unit: Unit;

    protected constructor(config: IRasterSymbology) {
        super();
        if (config.unit instanceof Unit) {
            this.unit = config.unit;
        } else {
            this.unit = Unit.fromDict(config.unit as UnitDict);
        }

        if (config.opacity) {
            this.opacity = config.opacity;
        }
    }

    isContinuous() {
        return this.unit.interpolation === Interpolation.Continuous;
    }

    isDiscrete() {
        return this.unit.interpolation === Interpolation.Discrete;
    }

    isUnknown() {
        return !this.unit || !this.unit.interpolation || this.unit.interpolation === 0;
    }

    abstract getSymbologyType(): SymbologyType;

    abstract toConfig(): IRasterSymbology;

    abstract clone(): AbstractRasterSymbology;

    equals(other: AbstractRasterSymbology) {
        return this.opacity === other.opacity
            && this.unit === other.unit;
    }

    abstract toDict(): RasterSymbologyDict;
}

export class MappingRasterSymbology extends AbstractRasterSymbology
    implements IColorizerRasterSymbology {

    colorizer: ColorizerData;
    noDataColor: ColorBreakpoint;
    overflowColor: ColorBreakpoint;

    static createSymbology(config: IColorizerRasterSymbology) {
        return new MappingRasterSymbology(config);
    }

    protected constructor(config: IColorizerRasterSymbology) {
        super(config);
        this.colorizer = (config.colorizer) ? new ColorizerData(config.colorizer)
            : Colormap.createColorizerDataWithName('VIRIDIS', config.unit.min, config.unit.max);
        this.noDataColor = (config.noDataColor) ? new ColorBreakpoint(config.noDataColor)
            : new ColorBreakpoint({rgba: TRANSPARENT, value: 'NoData'});
        this.overflowColor = (config.overflowColor) ? new ColorBreakpoint(config.overflowColor)
            : new ColorBreakpoint({rgba: TRANSPARENT, value: 'Overflow'});
    }

    getSymbologyType(): SymbologyType {
        return SymbologyType.MAPPING_COLORIZER_RASTER;
    }

    isUnknown(): boolean {
        return super.isUnknown();
    }

    toConfig(): IColorizerRasterSymbology {
        return this.clone() as IColorizerRasterSymbology;
    }

    clone(): MappingRasterSymbology {
        return new MappingRasterSymbology(this);
    }

    equals(other: AbstractRasterSymbology) {
        if (other instanceof MappingRasterSymbology) {
            return super.equals(other as AbstractRasterSymbology)
                && this.colorizer && this.colorizer.equals(other.colorizer)
                && this.noDataColor && this.noDataColor.equals(other.noDataColor)
                && this.overflowColor && this.overflowColor.equals(other.overflowColor);
        }
        return false;
    }

    toDict(): RasterSymbologyDict {
        return {
            symbologyType: SymbologyType[SymbologyType.MAPPING_COLORIZER_RASTER],
            opacity: this.opacity,
            unit: this.unit.toDict(),
            colorizer: this.colorizer.toDict(),
            noDataColor: this.noDataColor.toDict(),
            overflowColor: this.overflowColor.toDict()
        };
    }

    mappingColorizerRequestString(): string {
        const mcbs: MappingRasterColorizerDict = {
            type: this.colorizer.type,
            nodata: this.noDataColor.asMappingRasterColorizerBreakpoint(),
            overflow: this.overflowColor.asMappingRasterColorizerBreakpoint(),
            breakpoints: this.colorizer.breakpoints.map(br => br.asMappingRasterColorizerBreakpoint())
        };
        return JSON.stringify(mcbs);
    }
}
