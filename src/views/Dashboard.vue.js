import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { api, isoDate } from '../types';
const today = ref(new Date());
const todayKey = computed(() => isoDate(today.value));
const cacheKey = (date) => `daymark-todos-${date}`;
function readCachedTodos(date) {
    try {
        const cached = localStorage.getItem(cacheKey(date));
        return cached ? JSON.parse(cached) : null;
    }
    catch {
        return null;
    }
}
function cacheTodos() {
    try {
        localStorage.setItem(cacheKey(todayKey.value), JSON.stringify(todos.value));
    }
    catch { /* Storage may be unavailable. */ }
}
const initialCache = readCachedTodos(todayKey.value);
const todos = ref(initialCache ?? []);
const loading = ref(initialCache === null);
const error = ref('');
const saveError = ref('');
const compactList = ref(localStorage.getItem('daymark-compact-list') === 'true');
function toggleCompactList() { compactList.value = !compactList.value; localStorage.setItem('daymark-compact-list', String(compactList.value)); }
const todayIndex = computed(() => today.value.getDay());
const dateLabel = computed(() => today.value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
const todaysTodos = computed(() => todos.value.filter(t => t.one_time ? !t.completed : t.days.includes(todayIndex.value)));
const displayItems = computed(() => {
    const entries = [];
    const groups = new Map();
    for (const todo of todaysTodos.value) {
        const name = todo.group_name?.trim();
        if (!name) {
            entries.push({ key: `todo-${todo.id}`, title: todo.title, todos: [todo] });
            continue;
        }
        const normalized = name.toLocaleLowerCase();
        let group = groups.get(normalized);
        if (!group) {
            group = { key: `group-${normalized}`, title: name, todos: [] };
            groups.set(normalized, group);
            entries.push(group);
        }
        group.todos.push(todo);
    }
    return entries;
});
const overallProgress = computed(() => {
    if (!todaysTodos.value.length)
        return 0;
    return Math.round(todaysTodos.value.reduce((total, todo) => total + taskPercentage(todo), 0) / todaysTodos.value.length);
});
const progressSeconds = ref(Object.fromEntries((initialCache ?? []).map(todo => [todo.id, Number(todo.elapsed_seconds) || 0])));
const activeTodo = ref(null);
const secondsLeft = ref(30 * 60);
const timerDuration = ref(30 * 60);
const running = ref(false);
let timer;
let midnightTimer;
let audioContext;
const timerText = computed(() => `${String(Math.floor(secondsLeft.value / 60)).padStart(2, '0')}:${String(secondsLeft.value % 60).padStart(2, '0')}`);
const timerProgress = computed(() => ((timerDuration.value - secondsLeft.value) / timerDuration.value) * 100);
function taskPercentage(todo) {
    if (todo.completed)
        return 100;
    const total = (todo.duration_minutes ?? 30) * 60;
    return total ? Math.min(100, Number(((progressSeconds.value[todo.id] || 0) / total * 100).toFixed(1))) : 0;
}
function groupPercentage(group) {
    if (!group.length)
        return 0;
    return Math.round(group.reduce((total, todo) => total + taskPercentage(todo), 0) / group.length);
}
function taskTimeLabel(todo) {
    const total = (todo.duration_minutes ?? 30) * 60;
    if (!total)
        return 'Untimed';
    const elapsed = Math.min(total, progressSeconds.value[todo.id] || 0);
    const format = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    return `${format(elapsed)} of ${format(total)}`;
}
async function loadTodos() {
    const cached = readCachedTodos(todayKey.value);
    if (cached) {
        todos.value = cached;
        progressSeconds.value = Object.fromEntries(cached.map(todo => [todo.id, Number(todo.elapsed_seconds) || 0]));
    }
    loading.value = cached === null;
    try {
        const rows = await api();
        todos.value = rows.map(t => ({ ...t, days: Array.isArray(t.days) ? t.days : JSON.parse(t.days), elapsed_seconds: Number(t.elapsed_seconds) || 0 }));
        progressSeconds.value = Object.fromEntries(todos.value.map(todo => [todo.id, todo.elapsed_seconds]));
        cacheTodos();
        error.value = '';
    }
    catch (e) {
        if (cached === null)
            error.value = e instanceof Error ? e.message : 'Could not load todos';
    }
    finally {
        loading.value = false;
    }
}
function refreshLocalDate() {
    const previousDate = todayKey.value;
    today.value = new Date();
    if (todayKey.value !== previousDate) {
        todos.value = readCachedTodos(todayKey.value) ?? [];
        progressSeconds.value = Object.fromEntries(todos.value.map(todo => [todo.id, Number(todo.elapsed_seconds) || 0]));
        void loadTodos();
    }
    scheduleLocalMidnight();
}
function scheduleLocalMidnight() {
    if (midnightTimer)
        clearTimeout(midnightTimer);
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    midnightTimer = setTimeout(refreshLocalDate, nextMidnight.getTime() - now.getTime() + 1000);
}
onMounted(() => { void loadTodos(); scheduleLocalMidnight(); window.addEventListener('keydown', onKeydown); document.addEventListener('visibilitychange', refreshLocalDate); });
onBeforeUnmount(() => { saveActiveProgress(); stopTimer(); if (midnightTimer)
    clearTimeout(midnightTimer); window.removeEventListener('keydown', onKeydown); document.removeEventListener('visibilitychange', refreshLocalDate); });
function openTimer(todo) { saveActiveProgress(); stopTimer(); activeTodo.value = todo; timerDuration.value = (todo.duration_minutes ?? 30) * 60; secondsLeft.value = Math.max(0, timerDuration.value - (progressSeconds.value[todo.id] || 0)); }
async function startTimer() {
    if (running.value || secondsLeft.value === 0)
        return;
    audioContext ||= new AudioContext();
    if (audioContext.state === 'suspended')
        await audioContext.resume();
    playButtonBeep(660);
    running.value = true;
    timer = setInterval(() => {
        if (secondsLeft.value > 0) {
            secondsLeft.value--;
            if (activeTodo.value) {
                activeTodo.value.elapsed_seconds = timerDuration.value - secondsLeft.value;
                progressSeconds.value[activeTodo.value.id] = activeTodo.value.elapsed_seconds;
            }
            if (activeTodo.value && progressSeconds.value[activeTodo.value.id] % 5 === 0)
                void persistProgress(activeTodo.value);
        }
        if (secondsLeft.value === 0) {
            stopTimer();
            playCompletionChime();
            void completeActiveTodo();
        }
    }, 1000);
}
function stopTimer() { running.value = false; if (timer)
    clearInterval(timer); timer = undefined; }
function pauseTimer() { if (!running.value)
    return; playButtonBeep(390); stopTimer(); saveActiveProgress(); }
function closeTimer() { stopTimer(); saveActiveProgress(); activeTodo.value = null; }
function onKeydown(event) { if (event.key === 'Escape' && activeTodo.value)
    closeTimer(); }
async function completeActiveTodo() {
    const todo = activeTodo.value;
    if (!todo || todo.completed)
        return;
    todo.completed = true;
    try {
        await api('PATCH', { id: todo.id, date: isoDate(), completed: true });
        cacheTodos();
    }
    catch {
        todo.completed = false;
    }
}
function saveActiveProgress() { if (activeTodo.value && timerDuration.value > 0)
    void persistProgress(activeTodo.value); }
async function persistProgress(todo) {
    const elapsed = progressSeconds.value[todo.id] || 0;
    todo.elapsed_seconds = elapsed;
    try {
        await api('PATCH', { id: todo.id, date: isoDate(), elapsed_seconds: elapsed });
        cacheTodos();
        saveError.value = '';
    }
    catch (cause) {
        saveError.value = cause instanceof Error ? cause.message : 'Progress could not be saved';
    }
}
async function toggleUntimed() {
    const todo = activeTodo.value;
    if (!todo)
        return;
    audioContext ||= new AudioContext();
    if (audioContext.state === 'suspended')
        await audioContext.resume();
    const previous = Boolean(todo.completed);
    playButtonBeep(previous ? 390 : 660);
    todo.completed = !previous;
    try {
        await api('PATCH', { id: todo.id, date: isoDate(), completed: Boolean(todo.completed) });
        cacheTodos();
        if (!previous)
            closeTimer();
    }
    catch {
        todo.completed = previous;
    }
}
async function toggleGroupedTodo(todo) {
    const previous = Boolean(todo.completed);
    todo.completed = !previous;
    try {
        await api('PATCH', { id: todo.id, date: isoDate(), completed: Boolean(todo.completed) });
        saveError.value = '';
    }
    catch (cause) {
        todo.completed = previous;
        saveError.value = cause instanceof Error ? cause.message : 'Could not update item';
    }
}
function playButtonBeep(frequency) {
    if (!audioContext)
        return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.13, now);
    gain.gain.exponentialRampToValueAtTime(.001, now + .1);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + .11);
}
function playCompletionChime() {
    if (!audioContext)
        return;
    const now = audioContext.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = now + index * .18;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.22, start + .025);
        gain.gain.exponentialRampToValueAtTime(.001, start + .65);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + .68);
    });
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "dashboard-view" },
});
/** @type {__VLS_StyleScopedClasses['dashboard-view']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "hero dashboard-hero" },
});
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
(__VLS_ctx.dateLabel);
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "lede" },
});
/** @type {__VLS_StyleScopedClasses['lede']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "overall-progress" },
    role: "img",
    'aria-label': (`${__VLS_ctx.overallProgress}% overall progress across ${__VLS_ctx.todaysTodos.length} tasks`),
});
/** @type {__VLS_StyleScopedClasses['overall-progress']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "progress-pie" },
    ...{ style: ({ '--overall-progress': __VLS_ctx.overallProgress + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['progress-pie']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
(__VLS_ctx.overallProgress);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "card focus-card" },
    ...{ class: ({ 'compact-list': __VLS_ctx.compactList }) },
    'aria-live': "polite",
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['focus-card']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-list']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-head" },
});
/** @type {__VLS_StyleScopedClasses['card-head']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
(__VLS_ctx.todaysTodos.length);
(__VLS_ctx.todaysTodos.length === 1 ? 'task' : 'tasks');
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "list-head-actions" },
});
/** @type {__VLS_StyleScopedClasses['list-head-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "list-readonly" },
});
/** @type {__VLS_StyleScopedClasses['list-readonly']} */ ;
if (__VLS_ctx.todaysTodos.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.toggleCompactList) },
        ...{ class: "density-toggle" },
        'aria-pressed': (__VLS_ctx.compactList),
    });
    /** @type {__VLS_StyleScopedClasses['density-toggle']} */ ;
    (__VLS_ctx.compactList ? 'Comfortable' : 'Condense');
}
if (__VLS_ctx.saveError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "save-error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['save-error']} */ ;
    (__VLS_ctx.saveError);
}
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "state" },
    });
    /** @type {__VLS_StyleScopedClasses['state']} */ ;
}
else if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "state error" },
    });
    /** @type {__VLS_StyleScopedClasses['state']} */ ;
    /** @type {__VLS_StyleScopedClasses['error']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
    (__VLS_ctx.error);
}
else if (!__VLS_ctx.todaysTodos.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "state" },
    });
    /** @type {__VLS_StyleScopedClasses['state']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "sun" },
    });
    /** @type {__VLS_StyleScopedClasses['sun']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.br)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "todo-list" },
    });
    /** @type {__VLS_StyleScopedClasses['todo-list']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.displayItems))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (item.key),
            ...{ class: ({ 'focus-complete': item.todos.length === 1 && item.todos[0].completed, 'task-group': Boolean(item.todos[0].group_name) }) },
        });
        /** @type {__VLS_StyleScopedClasses['focus-complete']} */ ;
        /** @type {__VLS_StyleScopedClasses['task-group']} */ ;
        if (item.todos[0].group_name) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.details, __VLS_intrinsics.details)({
                ...{ class: "group-details" },
            });
            /** @type {__VLS_StyleScopedClasses['group-details']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.summary, __VLS_intrinsics.summary)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (item.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.small, __VLS_intrinsics.small)({});
            (item.todos.filter(todo => todo.completed).length);
            (item.todos.length);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "group-summary-progress" },
            });
            /** @type {__VLS_StyleScopedClasses['group-summary-progress']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (__VLS_ctx.groupPercentage(item.todos));
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "group-chevron" },
                'aria-hidden': "true",
            });
            /** @type {__VLS_StyleScopedClasses['group-chevron']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "group-progress" },
                role: "progressbar",
                'aria-label': (`${item.title} group progress`),
                'aria-valuenow': (__VLS_ctx.groupPercentage(item.todos)),
                'aria-valuemin': "0",
                'aria-valuemax': "100",
            });
            /** @type {__VLS_StyleScopedClasses['group-progress']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ style: ({ width: __VLS_ctx.groupPercentage(item.todos) + '%' }) },
            });
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "group-items" },
            });
            /** @type {__VLS_StyleScopedClasses['group-items']} */ ;
            for (const [todo] of __VLS_vFor((item.todos))) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
                    key: (todo.id),
                    ...{ class: ({ complete: todo.completed }) },
                });
                /** @type {__VLS_StyleScopedClasses['complete']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                    ...{ onChange: (...[$event]) => {
                            if (!!(__VLS_ctx.loading))
                                throw 0;
                            if (!!(__VLS_ctx.error))
                                throw 0;
                            if (!!(!__VLS_ctx.todaysTodos.length))
                                throw 0;
                            if (!(item.todos[0].group_name))
                                throw 0;
                            return (__VLS_ctx.toggleGroupedTodo(todo));
                            // @ts-ignore
                            [dateLabel, overallProgress, overallProgress, overallProgress, todaysTodos, todaysTodos, todaysTodos, todaysTodos, todaysTodos, compactList, compactList, compactList, toggleCompactList, saveError, saveError, loading, error, error, displayItems, groupPercentage, groupPercentage, groupPercentage, toggleGroupedTodo,];
                        } },
                    type: "checkbox",
                    checked: (Boolean(todo.completed)),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "check" },
                });
                /** @type {__VLS_StyleScopedClasses['check']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (todo.title);
                // @ts-ignore
                [];
            }
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(__VLS_ctx.loading))
                            throw 0;
                        if (!!(__VLS_ctx.error))
                            throw 0;
                        if (!!(!__VLS_ctx.todaysTodos.length))
                            throw 0;
                        if (!!(item.todos[0].group_name))
                            throw 0;
                        return (__VLS_ctx.openTimer(item.todos[0]));
                        // @ts-ignore
                        [openTimer,];
                    } },
                ...{ class: "task-open" },
            });
            /** @type {__VLS_StyleScopedClasses['task-open']} */ ;
            for (const [todo] of __VLS_vFor((item.todos))) {
                __VLS_asFunctionalElement(__VLS_intrinsics.template)({
                    key: (todo.id),
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "task-meta" },
                });
                /** @type {__VLS_StyleScopedClasses['task-meta']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (todo.title);
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
                (__VLS_ctx.taskPercentage(todo));
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "task-progress" },
                    role: "progressbar",
                    'aria-label': (`${todo.title} progress`),
                    'aria-valuenow': (__VLS_ctx.taskPercentage(todo)),
                    'aria-valuemin': "0",
                    'aria-valuemax': "100",
                });
                /** @type {__VLS_StyleScopedClasses['task-progress']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ style: ({ width: __VLS_ctx.taskPercentage(todo) + '%' }) },
                });
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "task-status" },
                });
                /** @type {__VLS_StyleScopedClasses['task-status']} */ ;
                (todo.completed ? 'Completed ✓' : __VLS_ctx.taskTimeLabel(todo));
                // @ts-ignore
                [taskPercentage, taskPercentage, taskPercentage, taskTimeLabel,];
            }
        }
        // @ts-ignore
        [];
    }
}
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.activeTodo) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.closeTimer) },
        ...{ class: "modal-backdrop" },
        role: "presentation",
    });
    /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ onClick: () => { } },
        ...{ class: "timer-modal" },
        role: "dialog",
        'aria-modal': "true",
        'aria-labelledby': "timer-title",
    });
    /** @type {__VLS_StyleScopedClasses['timer-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.closeTimer) },
        ...{ class: "modal-close" },
        'aria-label': "Close timer",
    });
    /** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        id: "timer-title",
    });
    (__VLS_ctx.activeTodo.title);
    if (__VLS_ctx.timerDuration > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "timer-ring" },
            ...{ style: ({ '--timer-progress': __VLS_ctx.timerProgress + '%' }) },
        });
        /** @type {__VLS_StyleScopedClasses['timer-ring']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.timerText);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.secondsLeft === 0 ? 'Nice work!' : __VLS_ctx.running ? 'Stay with it' : 'Ready when you are');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "untimed-state" },
        });
        /** @type {__VLS_StyleScopedClasses['untimed-state']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.activeTodo.completed ? '✓' : '∞');
        __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
        (__VLS_ctx.activeTodo.completed ? 'Completed for today' : 'No timer needed');
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    }
    if (__VLS_ctx.timerDuration > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "timer-actions" },
        });
        /** @type {__VLS_StyleScopedClasses['timer-actions']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.activeTodo))
                        throw 0;
                    if (!(__VLS_ctx.timerDuration > 0))
                        throw 0;
                    return (__VLS_ctx.running ? __VLS_ctx.pauseTimer() : __VLS_ctx.startTimer());
                    // @ts-ignore
                    [activeTodo, activeTodo, activeTodo, activeTodo, closeTimer, closeTimer, timerDuration, timerDuration, timerProgress, timerText, secondsLeft, running, running, pauseTimer, startTimer,];
                } },
            ...{ class: "timer-toggle" },
            ...{ class: ({ paused: __VLS_ctx.running }) },
            disabled: (__VLS_ctx.secondsLeft === 0),
        });
        /** @type {__VLS_StyleScopedClasses['timer-toggle']} */ ;
        /** @type {__VLS_StyleScopedClasses['paused']} */ ;
        (__VLS_ctx.running ? 'Pause' : __VLS_ctx.secondsLeft < __VLS_ctx.timerDuration ? 'Resume' : 'Start');
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
            ...{ onClick: (__VLS_ctx.toggleUntimed) },
            ...{ class: "untimed-toggle" },
            ...{ class: ({ undo: __VLS_ctx.activeTodo.completed }) },
        });
        /** @type {__VLS_StyleScopedClasses['untimed-toggle']} */ ;
        /** @type {__VLS_StyleScopedClasses['undo']} */ ;
        (__VLS_ctx.activeTodo.completed ? 'Undo' : 'Done');
    }
    if (__VLS_ctx.timerDuration > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "timer-note" },
        });
        /** @type {__VLS_StyleScopedClasses['timer-note']} */ ;
        (__VLS_ctx.activeTodo.duration_minutes ?? 30);
    }
}
// @ts-ignore
[activeTodo, activeTodo, activeTodo, timerDuration, timerDuration, secondsLeft, secondsLeft, running, running, toggleUntimed,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
