import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
const savedTheme = localStorage.getItem('daymark-theme');
const dark = ref(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
function applyTheme() {
    document.documentElement.dataset.theme = dark.value ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark.value ? '#071c2e' : '#1769aa');
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
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    to: "/",
}));
const __VLS_8 = __VLS_7({
    to: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
var __VLS_9;
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
let __VLS_12;
/** @ts-ignore @type { | typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    to: "/settings",
    ...{ class: "settings-link" },
    'aria-label': "Settings",
    title: "Settings",
}));
const __VLS_14 = __VLS_13({
    to: "/settings",
    ...{ class: "settings-link" },
    'aria-label': "Settings",
    title: "Settings",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
/** @type {__VLS_StyleScopedClasses['settings-link']} */ ;
const { default: __VLS_17 } = __VLS_15.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    'aria-hidden': "true",
});
// @ts-ignore
[toggleTheme, dark, dark, dark,];
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({});
let __VLS_18;
/** @ts-ignore @type { | typeof __VLS_components.RouterView} */
RouterView;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
