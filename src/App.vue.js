import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { requestSync, syncMessage, syncState } from './sync';
const savedTheme = localStorage.getItem('daymark-theme');
const dark = ref(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
function applyTheme() {
    document.documentElement.dataset.theme = dark.value ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark.value ? '#24282e' : '#f3f3f4');
}
function toggleTheme() { dark.value = !dark.value; localStorage.setItem('daymark-theme', dark.value ? 'dark' : 'light'); applyTheme(); }
applyTheme();
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "shell" },
});
/** @type {__VLS_StyleScopedClasses['shell']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "/",
    ...{ class: "brand" },
    'aria-label': "Daymark home",
}));
const __VLS_2 = __VLS_1({
    to: "/",
    ...{ class: "brand" },
    'aria-label': "Daymark home",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "brand-mark" },
});
/** @type {__VLS_StyleScopedClasses['brand-mark']} */ ;
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    'aria-label': "Main navigation",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleTheme) },
    ...{ class: "theme-toggle" },
    'aria-label': (`Switch to ${__VLS_ctx.dark ? 'light' : 'dark'} mode`),
    title: (`${__VLS_ctx.dark ? 'Light' : 'Dark'} mode`),
});
/** @type {__VLS_StyleScopedClasses['theme-toggle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-hidden': "true",
});
(__VLS_ctx.dark ? '☀' : '☾');
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.requestSync) },
    ...{ class: "sync-button header-sync" },
    ...{ class: (`sync-${__VLS_ctx.syncState}`) },
    disabled: (__VLS_ctx.syncState === 'syncing'),
    'aria-label': (__VLS_ctx.syncMessage),
    title: (__VLS_ctx.syncMessage),
});
/** @type {__VLS_StyleScopedClasses['sync-button']} */ ;
/** @type {__VLS_StyleScopedClasses['header-sync']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "sync-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['sync-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.RouterView} */
RouterView;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({});
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    to: "/settings",
    ...{ class: "settings-link" },
    'aria-label': "Settings",
    title: "Settings",
}));
const __VLS_13 = __VLS_12({
    to: "/settings",
    ...{ class: "settings-link" },
    'aria-label': "Settings",
    title: "Settings",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
/** @type {__VLS_StyleScopedClasses['settings-link']} */ ;
const { default: __VLS_16 } = __VLS_14.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-hidden': "true",
});
// @ts-ignore
[toggleTheme, dark, dark, dark, requestSync, syncState, syncState, syncMessage, syncMessage,];
var __VLS_14;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "calendar-links" },
});
/** @type {__VLS_StyleScopedClasses['calendar-links']} */ ;
let __VLS_17;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    to: "/",
    ...{ class: "week-link" },
    'aria-label': "Today",
    title: "Today",
}));
const __VLS_19 = __VLS_18({
    to: "/",
    ...{ class: "week-link" },
    'aria-label': "Today",
    title: "Today",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
/** @type {__VLS_StyleScopedClasses['week-link']} */ ;
const { default: __VLS_22 } = __VLS_20.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "view-icon today-view-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['view-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['today-view-icon']} */ ;
// @ts-ignore
[];
var __VLS_20;
let __VLS_23;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    to: "/week",
    ...{ class: "week-link" },
    'aria-label': "Week view",
    title: "Week view",
}));
const __VLS_25 = __VLS_24({
    to: "/week",
    ...{ class: "week-link" },
    'aria-label': "Week view",
    title: "Week view",
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
/** @type {__VLS_StyleScopedClasses['week-link']} */ ;
const { default: __VLS_28 } = __VLS_26.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "view-icon week-view-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['view-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['week-view-icon']} */ ;
// @ts-ignore
[];
var __VLS_26;
let __VLS_29;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    to: "/month",
    ...{ class: "week-link" },
    'aria-label': "Month view",
    title: "Month view",
}));
const __VLS_31 = __VLS_30({
    to: "/month",
    ...{ class: "week-link" },
    'aria-label': "Month view",
    title: "Month view",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
/** @type {__VLS_StyleScopedClasses['week-link']} */ ;
const { default: __VLS_34 } = __VLS_32.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "view-icon month-view-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['view-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['month-view-icon']} */ ;
// @ts-ignore
[];
var __VLS_32;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
