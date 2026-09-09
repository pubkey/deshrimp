/**
 * The barrel: one import for the whole component library.
 *
 * The documentation for a component is the comment at the top of its own
 * file. Order below: helpers, then components alphabetically. A new
 * component needs a line here and nothing else.
 *
 * Order below: helpers, then components alphabetically. A new component needs a
 * line here and nothing else.
 */


export {cx} from './cx';
export {toast} from './toast';
export {applyTheme, readTheme, systemIsDark} from './theme';
export {deDate, daysSince} from './dates';
export {mapsUrl, directionsUrl, prettyUrl} from './links';
export {PAGE, mount} from './page-data';
export {setUiLang, uiLang, uiText, uiLocale, preferredUiLang, type UiLang, type UiText} from './lang';

export {AsOf} from './AsOf';
export {Badge} from './Badge';
export {Button} from './Button';
export {Callout} from './Callout';
export {Checkbox} from './Checkbox';
export {Col} from './Col';
export {ConfirmButton} from './ConfirmButton';
export {DataGaps} from './DataGaps';
export {Details} from './Details';
export {Empty} from './Empty';
export {Field} from './Field';
export {Grid} from './Grid';
export {IconButton} from './IconButton';
export {Input} from './Input';
export {LanguagePicker} from './LanguagePicker';
export {LoadingOverlay} from './LoadingOverlay';
export {Markdown} from './Markdown';
export {Modal} from './Modal';
export {Muted} from './Muted';
export {Page} from './Page';
export {PageHeader} from './PageHeader';
export {PageMeta} from './PageMeta';
export {Panel} from './Panel';
export {Progress} from './Progress';
export {QRCode} from './QRCode';
export {Row} from './Row';
export {Section} from './Section';
export {Select} from './Select';
export {ShareButton} from './ShareButton';
export {ShareDialog} from './ShareDialog';
export {SourceList} from './SourceList';
export {Spinner} from './Spinner';
export {Stat} from './Stat';
export {StatusStrip} from './StatusStrip';
export {Table} from './Table';
export {Tabs} from './Tabs';
export {TaskBox} from './TaskBox';
export {Text} from './Text';
export {ThemeToggle} from './ThemeToggle';
export {Wrap} from './Wrap';

/* Constants and functions that belong to one component and live in its file. */
export {GAP_SEVERITIES, gapSeverity, DATA_GAPS_TITLE, DATA_GAPS_SUBTITLE} from './DataGaps';
export {PAGE_META_TITLE, PAGE_META_SUBTITLE} from './PageMeta';
export {SOURCE_LIST_TITLE} from './SourceList';

/* --------------------------------------------------------------- types */
/* Re-exported so an app can name what it passes: `const gaps: Gap[] = […]`. */

export type {Base, GapStep} from './_types';
export type {ButtonProps} from './Button';
export type {Gap, GapSeverity} from './DataGaps';
export type {ConfirmButtonProps} from './ConfirmButton';
export type {LanguagePickerProps} from './LanguagePicker';
export type {PageMetaProps} from './PageMeta';
export type {Source} from './SourceList';
export type {LoadingOverlayProps} from './LoadingOverlay';
export type {SpinnerProps} from './Spinner';
export type {StatusStripItem, StatusTone} from './StatusStrip';
export type {TableColumn} from './Table';
export type {TabItem} from './Tabs';
export type {Place} from './links';

// `PageMeta` the *type* is deliberately not re-exported here: the component of
// that name is, and one barrel cannot carry both. Import it from
// './page-data' if you need to name it.
export {pageData, setPageData} from './page-data';
