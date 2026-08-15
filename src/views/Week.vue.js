import { computed, onMounted, ref } from 'vue';
import { api, isoDate } from '../types';
const weekOffset = ref(0);
const days = ref([]);
const loading = ref(true);
const error = ref('');
function startOfWeek(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + weekOffset.value * 7);
    return start;
}
const weekStart = computed(() => startOfWeek(new Date()));
const weekLabel = computed(() => {
    const end = new Date(weekStart.value);
    end.setDate(end.getDate() + 6);
    const startText = weekStart.value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const endText = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startText} – ${endText}`;
});
function normalize(rows) {
    return rows.map(todo => ({ ...todo, days: Array.isArray(todo.days) ? todo.days : JSON.parse(todo.days), elapsed_seconds: Number(todo.elapsed_seconds) || 0 }));
}
function scheduledFor(todo, date) {
    return todo.one_time ? isoDate(date) === isoDate() : todo.days.includes(date.getDay());
}
function percentage(todo) {
    if (todo.completed)
        return 100;
    const duration = (todo.duration_minutes || 0) * 60;
    return duration ? Math.min(100, Math.round((todo.elapsed_seconds || 0) / duration * 100)) : 0;
}
function dayProgress(todos) {
    return todos.length ? Math.round(todos.reduce((sum, todo) => sum + percentage(todo), 0) / todos.length) : 0;
}
async function loadWeek() {
    loading.value = true;
    error.value = '';
    const dates = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart.value); date.setDate(date.getDate() + index); return date; });
    try {
        const results = await Promise.all(dates.map(date => api('GET', undefined, isoDate(date))));
        days.value = dates.map((date, index) => ({ date, todos: normalize(results[index]).filter(todo => scheduledFor(todo, date)) }));
    }
    catch (cause) {
        error.value = cause instanceof Error ? cause.message : 'Could not load this week';
    }
    finally {
        loading.value = false;
    }
}
function changeWeek(amount) { weekOffset.value += amount; void loadWeek(); }
function returnToThisWeek() { weekOffset.value = 0; void loadWeek(); }
onMounted(loadWeek);
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "week-view" },
});
/** @type {__VLS_StyleScopedClasses['week-view']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "hero week-hero" },
});
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['week-hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
(__VLS_ctx.weekLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "lede" },
});
/** @type {__VLS_StyleScopedClasses['lede']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "week-controls" },
});
/** @type {__VLS_StyleScopedClasses['week-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.changeWeek(-1));
            // @ts-ignore
            [weekLabel, changeWeek,];
        } },
    'aria-label': "Previous week",
});
if (__VLS_ctx.weekOffset) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.returnToThisWeek) },
        ...{ class: "this-week" },
    });
    /** @type {__VLS_StyleScopedClasses['this-week']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.changeWeek(1));
            // @ts-ignore
            [changeWeek, weekOffset, returnToThisWeek,];
        } },
    'aria-label': "Next week",
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
        ...{ class: "week-grid" },
        'aria-label': "Weekly tasks",
    });
    /** @type {__VLS_StyleScopedClasses['week-grid']} */ ;
    for (const [day] of __VLS_vFor((__VLS_ctx.days))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.article, __VLS_intrinsics.article)({
            key: (__VLS_ctx.isoDate(day.date)),
            ...{ class: "card week-day" },
            ...{ class: ({ today: __VLS_ctx.isoDate(day.date) === __VLS_ctx.isoDate() }) },
        });
        /** @type {__VLS_StyleScopedClasses['card']} */ ;
        /** @type {__VLS_StyleScopedClasses['week-day']} */ ;
        /** @type {__VLS_StyleScopedClasses['today']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (day.date.toLocaleDateString(undefined, { weekday: 'short' }));
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (day.date.getDate());
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.dayProgress(day.todos));
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "week-day-progress" },
        });
        /** @type {__VLS_StyleScopedClasses['week-day-progress']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ style: ({ width: __VLS_ctx.dayProgress(day.todos) + '%' }) },
        });
        if (!day.todos.length) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
                ...{ class: "week-empty" },
            });
            /** @type {__VLS_StyleScopedClasses['week-empty']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({});
            for (const [todo] of __VLS_vFor((day.todos))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
                    key: (todo.id),
                    ...{ class: ({ complete: todo.completed }) },
                });
                /** @type {__VLS_StyleScopedClasses['complete']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "week-check" },
                });
                /** @type {__VLS_StyleScopedClasses['week-check']} */ ;
                (todo.completed ? '✓' : '');
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
                (todo.title);
                if (todo.group_name) {
                    __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
                    (todo.group_name);
                }
                // @ts-ignore
                [loading, error, error, days, isoDate, isoDate, isoDate, dayProgress, dayProgress,];
            }
        }
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
