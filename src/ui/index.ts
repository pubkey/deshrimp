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


export { cx } from './cx';
export { toast } from './toast';
export { applyTheme, readTheme, systemIsDark } from './theme';
export { deDate, daysSince } from './dates';
export { money, parsePrice, formatPrice, sumPrices, isOwned } from './currency';
export { mapsUrl, directionsUrl, prettyUrl } from './links';
export { PAGE, mount } from './page-data';
export { setUiLang, uiLang, uiText, uiLocale, preferredUiLang, type UiLang, type UiText } from './lang';

export { AsOf } from './AsOf';
export { Assumed } from './Assumed';
export { Badge } from './Badge';
export { Because } from './Because';
export { BookingListing } from './BookingListing';
export { Box } from './Box';
export { Button } from './Button';
export { Callout } from './Callout';
export { Card } from './Card';
export { Carousel } from './Carousel';
export { Checkbox } from './Checkbox';
export { Col } from './Col';
export { Confidence } from './Confidence';
export { ConfirmButton } from './ConfirmButton';
export { Countdown } from './Countdown';
export { Criteria } from './Criteria';
export { DataGaps } from './DataGaps';
export { DayPlan } from './DayPlan';
export { Details } from './Details';
export { Distance } from './Distance';
export { Empty } from './Empty';
export { Eyebrow } from './Eyebrow';
export { Facts } from './Facts';
export { Field } from './Field';
export { ChatBubble } from './ChatBubble';
export { ChatRow } from './ChatRow';
export { Grid } from './Grid';
export { H1 } from './H1';
export { H2 } from './H2';
export { H3 } from './H3';
export { H4 } from './H4';
export { H5 } from './H5';
export { H6 } from './H6';
export { Heading } from './Heading';
export { Hours } from './Hours';
export { IconButton } from './IconButton';
export { ImageToggle } from './ImageToggle';
export { Img } from './Img';
export { Input } from './Input';
export { LanguagePicker } from './LanguagePicker';
export { Lead } from './Lead';
export { LoadingOverlay } from './LoadingOverlay';
export { Listing } from './Listing';
export { Markdown } from './Markdown';
export { Modal } from './Modal';
export { Money } from './Money';
export { Mono } from './Mono';
export { Muted } from './Muted';
export { Page } from './Page';
export { PageHeader } from './PageHeader';
export { PageMeta } from './PageMeta';
export { Panel } from './Panel';
export { PlaceCard } from './PlaceCard';
export { Price } from './Price';
export { Progress } from './Progress';
export { QRCode } from './QRCode';
export { RecipeCard } from './RecipeCard';
export { Row } from './Row';
export { Score } from './Score';
export { Section } from './Section';
export { Select } from './Select';
export { ShareButton } from './ShareButton';
export { ShareDialog } from './ShareDialog';
export { ShopItem } from './ShopItem';
export { ShopList } from './ShopList';
export { SourceList } from './SourceList';
export { Spacer } from './Spacer';
export { Spinner } from './Spinner';
export { SpotifyPlayer } from './SpotifyPlayer';
export { Stars } from './Stars';
export { Stat } from './Stat';
export { StatusStrip } from './StatusStrip';
export { StepList } from './StepList';
export { Table } from './Table';
export { Tabs } from './Tabs';
export { Tag } from './Tag';
export { TaskBox } from './TaskBox';
export { Text } from './Text';
export { TextArea } from './TextArea';
export { ThemeToggle } from './ThemeToggle';
export { Timeline } from './Timeline';
export { Toolbar } from './Toolbar';
export { Voyage } from './Voyage';
export { Wrap } from './Wrap';
export { YouTubeEmbed } from './YouTubeEmbed';

/* Constants and functions that belong to one component and live in its file. */
export { CONFIDENCE_LEVELS, confidenceLevel } from './Confidence';
export { CRITERIA_STATES, criteriaState } from './Criteria';
export { GAP_SEVERITIES, gapSeverity, DATA_GAPS_TITLE, DATA_GAPS_SUBTITLE } from './DataGaps';
export { hoursStatus, DAY_KEYS } from './Hours';
export { PAGE_META_TITLE, PAGE_META_SUBTITLE } from './PageMeta';
export { SOURCE_LIST_TITLE } from './SourceList';
export { titleLink } from './Listing';

/* --------------------------------------------------------------- types */
/* Re-exported so an app can name what it passes: `const gaps: Gap[] = […]`. */

export type { Base, GapStep } from './_types';
export type { ButtonProps } from './Button';
export type { Criterion, CriteriaOption, CriteriaValue, CriteriaState } from './Criteria';
export type { Gap, GapSeverity } from './DataGaps';
export type { Day, DayEntry } from './DayPlan';
export type { ChatBubbleProps } from './ChatBubble';
export type { ChatRowProps } from './ChatRow';
export type { WeekHours, DayKey, HoursStatus } from './Hours';
export type { ConfidenceLevel } from './Confidence';
export type { ConfirmButtonProps } from './ConfirmButton';
export type { LanguagePickerProps } from './LanguagePicker';
export type { ImageToggleOption } from './ImageToggle';
export type { ShopItemProps } from './ShopItem';
export type { PageMetaProps } from './PageMeta';
export type { Source } from './SourceList';
export type { LoadingOverlayProps } from './LoadingOverlay';
export type { SpinnerProps } from './Spinner';
export type { StatusStripItem, StatusTone } from './StatusStrip';
export type { Step } from './StepList';
export type { TableColumn } from './Table';
export type { TabItem } from './Tabs';
export type { TimelineEntry } from './Timeline';
export type { VoyageMark } from './Voyage';
export type { Fact } from './Facts';
export type { Place } from './links';

// `PageMeta` the *type* is deliberately not re-exported here: the component of
// that name is, and one barrel cannot carry both. Import it from
// './page-data' if you need to name it.
export { pageData, setPageData } from './page-data';
