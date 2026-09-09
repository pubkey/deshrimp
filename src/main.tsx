/**
 * The entry point.
 *
 * Three things have to happen before the first render, and this is the only
 * place that knows about all three: the design tokens and the app's own CSS get
 * pulled into the bundle, the page payload is filled in from `data.json` plus
 * the app config, and the remembered theme is restored (inside `mount`) so the
 * page does not flash the wrong one.
 */

import './ui/theme.css';
import './app/styles.css';

import { mount, setPageData } from './ui';
import config from './app/app.config';
import written from './app/data.json';
import App from './app/App';

setPageData({
    ...written,
    meta: {
        title: config.title,
        subtitle: config.subtitle,
        task: config.task,
        source: config.source,
        generated: __BUILD_DATE__,
        generatedAt: __BUILD_TIME__,
    },
});

mount(App);
