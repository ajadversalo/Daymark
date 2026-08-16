import { computed, onMounted, ref } from 'vue';
import { api, isoDate } from '../types';
const monthOffset = ref(0);
const days = ref([]);
const loading = ref(true);
const error = ref('');
const visibleMonth = computed(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth() + monthOffset.value, 1); });
const monthLabel = computed(() => visibleMonth.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }));
function calendarDates() {
    const first = visibleMonth.value;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
}
function normalize(rows) {
    return rows.map(todo => ({ ...todo, days: Array.isArray(todo.days) ? todo.days : JSON.parse(todo.days), elapsed_seconds: Number(todo.elapsed_seconds) || 0 }));
}
function scheduledFor(todo, date) { return todo.one_time ? isoDate(date) === isoDate() : todo.days.includes(date.getDay()); }
function taskProgress(todo) {
    if (todo.completed)
        return 100;
    const duration = (todo.duration_minutes || 0) * 60;
    return duration ? Math.min(100, (todo.elapsed_seconds || 0) / duration * 100) : 0;
}
function statusFor(todos) {
    if (!todos.length || todos.every(todo => taskProgress(todo) === 0))
        return 'none';
    return todos.every(todo => taskProgress(todo) === 100) ? 'complete' : 'partial';
}
function statusIcon(status) { return { none: '☹', partial: '📈', complete: '🏆' }[status]; }
function statusLabel(day) { return `${day.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}: ${day.status}`; }
async function loadMonth() {
    loading.value = true;
    error.value = '';
    const dates = calendarDates();
    try {
        const results = await Promise.all(dates.map(date => api('GET', undefined, isoDate(date))));
        days.value = dates.map((date, index) => ({ date, inMonth: date.getMonth() === visibleMonth.value.getMonth(), status: statusFor(normalize(results[index]).filter(todo => scheduledFor(todo, date))) }));
    }
    catch (cause) {
        error.value = cause instanceof Error ? cause.message : 'Could not load this month';
    }
    finally {
        loading.value = false;
    }
}
function changeMonth(amount) { monthOffset.value += amount; void loadMonth(); }
function returnToThisMonth() { monthOffset.value = 0; void loadMonth(); }
onMounted(loadMonth);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-view" },
});
/** @type {__VLS_StyleScopedClasses['month-view']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "hero month-hero" },
});
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['month-hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
(__VLS_ctx.monthLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "lede" },
});
/** @type {__VLS_StyleScopedClasses['lede']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-controls" },
});
/** @type {__VLS_StyleScopedClasses['month-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.changeMonth(-1));
            // @ts-ignore
            [monthLabel, changeMonth,];
        } },
    'aria-label': "Previous month",
});
if (__VLS_ctx.monthOffset) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.returnToThisMonth) },
        ...{ class: "this-month" },
    });
    /** @type {__VLS_StyleScopedClasses['this-month']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.changeMonth(1));
            // @ts-ignore
            [changeMonth, monthOffset, returnToThisMonth,];
        } },
    'aria-label': "Next month",
});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "card state" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['state']} */ ;
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "card state error" },
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['state']} */ ;
    /** @type {__VLS_StyleScopedClasses['error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    (__VLS_ctx.error);
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ class: "month-calendar card" },
        'aria-label': "Monthly progress",
    });
    /** @type {__VLS_StyleScopedClasses['month-calendar']} */ ;
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    for (const [name] of __VLS_vFor((['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (name),
            ...{ class: "month-weekday" },
        });
        /** @type {__VLS_StyleScopedClasses['month-weekday']} */ ;
        (name);
        // @ts-ignore
        [loading, error, error,];
    }
    for (const [day] of __VLS_vFor((__VLS_ctx.days))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (__VLS_ctx.isoDate(day.date)),
            ...{ class: "month-day" },
            ...{ class: ([{ muted: !day.inMonth, today: __VLS_ctx.isoDate(day.date) === __VLS_ctx.isoDate() }, `status-${day.status}`]) },
            'aria-label': (__VLS_ctx.statusLabel(day)),
        });
        /** @type {__VLS_StyleScopedClasses['month-day']} */ ;
        /** @type {__VLS_StyleScopedClasses['muted']} */ ;
        /** @type {__VLS_StyleScopedClasses['today']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "month-date" },
        });
        /** @type {__VLS_StyleScopedClasses['month-date']} */ ;
        (day.date.getDate());
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "status-icon" },
            'aria-hidden': "true",
        });
        /** @type {__VLS_StyleScopedClasses['status-icon']} */ ;
        (__VLS_ctx.statusIcon(day.status));
        // @ts-ignore
        [days, isoDate, isoDate, isoDate, statusLabel, statusIcon,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "month-legend" },
    'aria-label': "Status legend",
});
/** @type {__VLS_StyleScopedClasses['month-legend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "status-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['status-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "status-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['status-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.i, __VLS_intrinsics.i)({
    ...{ class: "status-icon" },
    'aria-hidden': "true",
});
/** @type {__VLS_StyleScopedClasses['status-icon']} */ ;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
