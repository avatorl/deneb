import powerbi from 'powerbi-visuals-api';
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import ISelectionIdBuilder = powerbi.visuals.ISelectionIdBuilder;
import ITooltipService = powerbi.extensibility.ITooltipService;
import IViewport = powerbi.IViewport;
import ViewMode = powerbi.ViewMode;
import EditMode = powerbi.EditMode;
import DataViewObjects = powerbi.DataViewObjects;
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import VisualObjectInstancesToPersist = powerbi.VisualObjectInstancesToPersist;
import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;

import JSONEditor from 'jsoneditor';
import { TopLevelSpec } from 'vega-lite';
import { Spec, Loader } from 'vega';

import VisualSettings from './properties/VisualSettings';
import DataLimitSettings from './properties/DataLimitSettings';
import {
    ITemplateDatasetField,
    IDenebTemplateMetadata
} from './schema/template-v1';
import { ErrorObject } from 'ajv';
import { IVisualDataset } from './api/dataset';
import { TEditorRole } from './api/editor';
import { TVisualInterface } from './api/interface';
import { ICompiledSpec, IFixResult, TSpecProvider } from './api/specification';
import { TTemplateExportState, TTemplateImportState } from './api/template';

/**
 * =====
 * Types
 * =====
 */

// Used for creating a new specification - can either be from existing templates, or imported
export type TTemplateProvider = TSpecProvider | 'import';
// USed to handle which export operation we currently have open
export type TExportOperation = 'information' | 'dataset' | 'template';
// Specify the start or end of a console group for the `Debugger`.
export type TDebugMethodMarkerExtent = 'start' | 'end';

// Modal dialog type (used for specific ops handling)
export type TModalDialogType = 'new' | 'export';
// Stages to within the store when processing data, and therefore give us some UI hooks for the end-user.
export type TDataProcessingStage =
    | 'Initial'
    | 'Fetching'
    | 'Processing'
    | 'Processed';
// Template type constraints for placeholders (currently not used).
export type TSupportedValueTypeDescriptor =
    | 'text'
    | 'numeric'
    | 'integer'
    | 'bool'
    | 'dateTime'
    | 'duration'
    | 'binary';

/**
 * ========
 * Services
 * ========
 */

/**
 * API to handle all logic around fetching more data from the data model, if needed.
 */
export interface IDataLoadingService {
    /**
     * Look at the data limit settings and data view, and carry out additional loading of data if required.
     *
     * @param options - visual update options.
     * @param settings - the current properties from the visual, to determine what additional loading should be
     *  carried out (if any).
     * @param host - visual host services (for calling `fetchMoreData`).
     */
    handleDataFetch: (
        options: VisualUpdateOptions,
        settings: DataLimitSettings,
        host: IVisualHost
    ) => void;
}

/**
 * API to handle signals from a Vega/Vega-Lite view and convert any elegible data point logic into suitable Power BI selection
 * operations.
 */
export interface ISelectionHandlerService {
    /**
     * For a selection event within the visual, attempt to resolve any eligible data points and broker their state with the
     * Power BI selection manager's `select` method.
     *
     * @param name - name of triggered selection from Vega view.
     * @param selection - array of selected data from Vega view.
     */
    handleDataPoint: (name: string, selection: any) => void;
    /**
     * For a contextmenu (right-click) event within the visual, attempt to resolve any eligible data points and broker their
     *  state with the Power BI selection manager's `showContextMenu` method.
     *
     * @param name - name of triggered selection from Vega view.
     * @param selection - array of selected data from Vega view.
     */
    handleContextMenu: (name: string, selection: any) => void;
}

/**
 * ===========
 * Redux store
 * ===========
 */

/**
 * Visual reducer state
 */
export interface IVisualSliceState {
    allowInteractions: boolean;
    autoApply: boolean;
    canAutoApply: boolean;
    categories: DataViewCategoryColumn[];
    dataset: IVisualDataset;
    dataProcessingStage: TDataProcessingStage;
    dataRowsLoaded: number;
    dataViewFlags: IDataViewFlags;
    dataViewObjects: DataViewObjects;
    dataWindowsLoaded: number;
    editMode: EditMode;
    editorPaneIsExpanded: boolean;
    fourd3d3d: boolean;
    fixResult: IFixResult;
    i18n: ILocalizationManager;
    interfaceType: TVisualInterface;
    isInFocus: boolean;
    isNewDialogVisible: boolean;
    isExportDialogVisible: boolean;
    launchUrl: (url: string) => void;
    loader: Loader;
    locale: string;
    persistProperties: (changes: VisualObjectInstancesToPersist) => void;
    resizablePaneDefaultWidth: number;
    resizablePaneExpandedWidth: number;
    resizablePaneWidth: number;
    settings: VisualSettings;
    selectedOperation: TEditorRole;
    selectionIdBuilder: () => ISelectionIdBuilder;
    selectionManager: ISelectionManager;
    spec: ICompiledSpec;
    themeColors: string[];
    tooltipService: ITooltipService;
    updates: number;
    vegaViewport: IViewport;
    viewMode: ViewMode;
    viewport: IViewport;
}

/**
 * Template reducer state
 */
export interface ITemplateSliceState {
    selectedTemplateIndex: number;
    templateFile: File;
    templateImportState: TTemplateImportState;
    templateExportState: TTemplateExportState;
    templateImportErrorMessage: string;
    templateExportErrorMessage: string;
    templateSchemaErrors: ErrorObject[];
    templateFileRawContent: string;
    templateToApply: Spec | TopLevelSpec;
    templateExportMetadata: IDenebTemplateMetadata;
    allImportCriteriaApplied: boolean;
    allExportCriteriaApplied: boolean;
    templateProvider: TTemplateProvider;
    specProvider: TSpecProvider;
    selectedExportOperation: TExportOperation;
    vegaLite: TopLevelSpec[];
    vega: Spec[];
}

// Action Payloads...
export interface IVisualDatasetUpdatePayload {
    categories: DataViewCategoryColumn[];
    dataset: IVisualDataset;
}

export interface ISpecDataPlaceHolderDropdownProps {
    datasetField: ITemplateDatasetField;
}

export interface IPlaceholderValuePayload {
    key: string;
    objectName: string;
}

export interface IDataViewFlags {
    hasValidDataViewMapping: boolean;
    hasValidDataRoles: boolean;
    hasValidDataView: boolean;
}

export interface IVisualUpdatePayload {
    settings: VisualSettings;
    options: VisualUpdateOptions;
}

export interface IEditorPaneUpdatePayload {
    editorPaneWidth: number;
    editorPaneExpandedWidth: number;
}

export interface IEditorReferencePayload {
    role: TEditorRole;
    editor: JSONEditor;
}

export interface IDebugLogOptions {
    owner?: string;
    profile?: boolean;
    report?: boolean;
}

export interface IDebugProfileDetail {
    owner: string;
    methodName: string;
    duration: number;
}

export interface IUiBaseProps {
    i18n: ILocalizationManager;
}

export interface ISpecificationErrorProps extends IUiBaseProps {
    error: string;
}

export interface IDataFetchingProps extends IUiBaseProps {
    dataRowsLoaded: number;
    dataLimit: DataLimitSettings;
}

export interface IModalDialogProps {
    type: TModalDialogType;
    visible: boolean;
}

export interface IModalHeaderProps {
    type: TModalDialogType;
}
export interface IProgressProps {
    description: string;
}

export interface IDataFieldLabelProps {
    datasetField: ITemplateDatasetField;
}

export interface IFieldInfoIconProps {
    description: string;
}

export interface ICappedTextFieldProps {
    id: string;
    i18nLabel: string;
    i18nPlaceholder: string;
    i18nAssistiveText?: string;
    maxLength: number;
    multiline?: boolean;
    inline?: boolean;
    description?: string;
}

export interface ILocaleConfiguration {
    default: string;
    format: ILocaleFormatConfiguration;
    timeFormat: ILocaleTimeConfiguration;
}

export interface ILocaleFormatConfiguration {
    [key: string]: Record<string, unknown>;
}

export interface ILocaleTimeConfiguration {
    [key: string]: Record<string, unknown>;
}
