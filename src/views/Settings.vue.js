import { onMounted, ref } from 'vue';
import { api, dayNames, isoDate } from '../types';
const todos = ref([]);
const title = ref('');
const groupName = ref('');
const duration = ref(30);
const days = ref([1, 2, 3, 4, 5]);
const scheduleType = ref('recurring');
const error = ref('');
const saving = ref(false);
const editingId = ref(null);
const editingTitle = ref('');
const editingGroup = ref('');
const editSaving = ref(false);
const showAdd = ref(false);
const showClearConfirmation = ref(false);
const clearingProgress = ref(false);
const clearMessage = ref('');
async function load() { try {
    const rows = await api();
    todos.value = rows.map(t => ({ ...t, days: JSON.parse(t.days) }));
}
catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not load todos';
} }
onMounted(load);
function dayToggle(day) { days.value = days.value.includes(day) ? days.value.filter(d => d !== day) : [...days.value, day].sort(); }
async function add() { if (!title.value.trim() || (scheduleType.value === 'recurring' && !days.value.length) || duration.value < 0)
    return; saving.value = true; error.value = ''; try {
    const item = await api('POST', { title: title.value.trim(), group_name: groupName.value.trim() || null, days: scheduleType.value === 'once' ? [] : days.value, one_time: scheduleType.value === 'once', duration_minutes: duration.value });
    todos.value.push({ ...item, completed: false });
    title.value = '';
    groupName.value = '';
    duration.value = 30;
    days.value = [1, 2, 3, 4, 5];
    scheduleType.value = 'recurring';
    showAdd.value = false;
}
catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not save todo';
}
finally {
    saving.value = false;
} }
async function remove(todo) { await api('DELETE', { id: todo.id }); todos.value = todos.value.filter(t => t.id !== todo.id); }
function beginEdit(todo) { editingId.value = todo.id; editingTitle.value = todo.title; editingGroup.value = todo.group_name || ''; }
function cancelEdit() { editingId.value = null; editingTitle.value = ''; editingGroup.value = ''; }
async function saveEdit(todo) {
    const nextTitle = editingTitle.value.trim();
    if (!nextTitle)
        return;
    editSaving.value = true;
    error.value = '';
    const nextGroup = editingGroup.value.trim() || null;
    try {
        await api('PATCH', { id: todo.id, title: nextTitle, group_name: nextGroup });
        todo.title = nextTitle;
        todo.group_name = nextGroup;
        cancelEdit();
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Could not update the item';
    }
    finally {
        editSaving.value = false;
    }
}
async function clearTodaysProgress() {
    clearingProgress.value = true;
    error.value = '';
    clearMessage.value = '';
    try {
        await api('PATCH', { clear_progress_on: isoDate() });
        showClearConfirmation.value = false;
        clearMessage.value = "Today's progress has been cleared.";
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : "Could not clear today's progress";
    }
    finally {
        clearingProgress.value = false;
    }
}
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "hero compact settings-hero" },
});
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-hero']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "lede" },
});
/** @type {__VLS_StyleScopedClasses['lede']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.showAdd = true);
            // @ts-ignore
            [showAdd,];
        } },
    ...{ class: "add-trigger" },
    'aria-label': "Add a new item",
    title: "Add item",
});
/** @type {__VLS_StyleScopedClasses['add-trigger']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "settings-grid" },
});
/** @type {__VLS_StyleScopedClasses['settings-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "card routine-card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['routine-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
if (!__VLS_ctx.todos.length) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "state" },
    });
    /** @type {__VLS_StyleScopedClasses['state']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "routine-list" },
    });
    /** @type {__VLS_StyleScopedClasses['routine-list']} */ ;
    for (const [todo] of __VLS_vFor((__VLS_ctx.todos))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            key: (todo.id),
        });
        if (__VLS_ctx.editingId === todo.id) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
                ...{ onSubmit: (...[$event]) => {
                        if (!!(!__VLS_ctx.todos.length))
                            throw 0;
                        if (!(__VLS_ctx.editingId === todo.id))
                            throw 0;
                        return (__VLS_ctx.saveEdit(todo));
                        // @ts-ignore
                        [todos, todos, editingId, saveEdit,];
                    } },
                ...{ class: "inline-edit" },
            });
            /** @type {__VLS_StyleScopedClasses['inline-edit']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "inline-edit-fields" },
            });
            /** @type {__VLS_StyleScopedClasses['inline-edit-fields']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                maxlength: "100",
                'aria-label': (`Edit ${todo.title}`),
                autofocus: true,
            });
            (__VLS_ctx.editingTitle);
            __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
                maxlength: "60",
                'aria-label': "Group name",
                placeholder: "Group (optional)",
            });
            (__VLS_ctx.editingGroup);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                type: "submit",
                ...{ class: "edit-save" },
                disabled: (__VLS_ctx.editSaving || !__VLS_ctx.editingTitle.trim()),
            });
            /** @type {__VLS_StyleScopedClasses['edit-save']} */ ;
            (__VLS_ctx.editSaving ? 'Saving…' : 'Save');
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (__VLS_ctx.cancelEdit) },
                type: "button",
                ...{ class: "edit-cancel" },
            });
            /** @type {__VLS_StyleScopedClasses['edit-cancel']} */ ;
        }
        else {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
            __VLS_asFunctionalElement1(__VLS_intrinsics.strong, __VLS_intrinsics.strong)({});
            (todo.title);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            if (todo.group_name) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "group-tag" },
                });
                /** @type {__VLS_StyleScopedClasses['group-tag']} */ ;
                (todo.group_name);
            }
            (todo.one_time ? `One time${todo.completed ? ' · Done' : ''}` : todo.days.map(d => __VLS_ctx.dayNames[d]).join(' · '));
            ((todo.duration_minutes ?? 30) === 0 ? 'Untimed' : `${todo.duration_minutes ?? 30} min`);
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "item-actions" },
            });
            /** @type {__VLS_StyleScopedClasses['item-actions']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.todos.length))
                            throw 0;
                        if (!!(__VLS_ctx.editingId === todo.id))
                            throw 0;
                        return (__VLS_ctx.beginEdit(todo));
                        // @ts-ignore
                        [editingTitle, editingTitle, editingGroup, editSaving, editSaving, cancelEdit, dayNames, beginEdit,];
                    } },
                ...{ class: "edit" },
            });
            /** @type {__VLS_StyleScopedClasses['edit']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!!(!__VLS_ctx.todos.length))
                            throw 0;
                        if (!!(__VLS_ctx.editingId === todo.id))
                            throw 0;
                        return (__VLS_ctx.remove(todo));
                        // @ts-ignore
                        [remove,];
                    } },
                ...{ class: "delete" },
                'aria-label': (`Delete ${todo.title}`),
            });
            /** @type {__VLS_StyleScopedClasses['delete']} */ ;
        }
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "card progress-settings-card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-settings-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "eyebrow" },
});
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            return (__VLS_ctx.showClearConfirmation = true);
            // @ts-ignore
            [showClearConfirmation,];
        } },
    ...{ class: "clear-progress-trigger" },
});
/** @type {__VLS_StyleScopedClasses['clear-progress-trigger']} */ ;
if (__VLS_ctx.clearMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "clear-success" },
        role: "status",
    });
    /** @type {__VLS_StyleScopedClasses['clear-success']} */ ;
    (__VLS_ctx.clearMessage);
}
if (__VLS_ctx.error) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "inline-error" },
        role: "alert",
    });
    /** @type {__VLS_StyleScopedClasses['inline-error']} */ ;
    (__VLS_ctx.error);
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
if (__VLS_ctx.showAdd) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAdd))
                    throw 0;
                return (__VLS_ctx.showAdd = false);
                // @ts-ignore
                [showAdd, showAdd, clearMessage, clearMessage, error, error,];
            } },
        ...{ class: "modal-backdrop" },
        role: "presentation",
    });
    /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.form, __VLS_intrinsics.form)({
        ...{ onSubmit: (__VLS_ctx.add) },
        ...{ onClick: () => { } },
        ...{ class: "card form-card add-modal" },
        role: "dialog",
        'aria-modal': "true",
        'aria-labelledby': "add-title",
    });
    /** @type {__VLS_StyleScopedClasses['card']} */ ;
    /** @type {__VLS_StyleScopedClasses['form-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['add-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAdd))
                    throw 0;
                return (__VLS_ctx.showAdd = false);
                // @ts-ignore
                [showAdd, add,];
            } },
        type: "button",
        ...{ class: "modal-close" },
        'aria-label': "Close add item form",
    });
    /** @type {__VLS_StyleScopedClasses['modal-close']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        id: "add-title",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        maxlength: "100",
        placeholder: "e.g. Take a morning walk",
        autofocus: true,
    });
    (__VLS_ctx.title);
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field duration-field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "optional" },
    });
    /** @type {__VLS_StyleScopedClasses['optional']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input)({
        maxlength: "60",
        placeholder: "e.g. Morning routine",
    });
    (__VLS_ctx.groupName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-help" },
    });
    /** @type {__VLS_StyleScopedClasses['field-help']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
        ...{ class: "field duration-field" },
    });
    /** @type {__VLS_StyleScopedClasses['field']} */ ;
    /** @type {__VLS_StyleScopedClasses['duration-field']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "number",
        min: "0",
        max: "240",
        step: "1",
        inputmode: "numeric",
    });
    (__VLS_ctx.duration);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "field-help" },
    });
    /** @type {__VLS_StyleScopedClasses['field-help']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.legend, __VLS_intrinsics.legend)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "schedule-picker" },
    });
    /** @type {__VLS_StyleScopedClasses['schedule-picker']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAdd))
                    throw 0;
                return (__VLS_ctx.scheduleType = 'recurring');
                // @ts-ignore
                [title, groupName, duration, scheduleType,];
            } },
        type: "button",
        ...{ class: ({ active: __VLS_ctx.scheduleType === 'recurring' }) },
        'aria-pressed': (__VLS_ctx.scheduleType === 'recurring'),
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showAdd))
                    throw 0;
                return (__VLS_ctx.scheduleType = 'once');
                // @ts-ignore
                [scheduleType, scheduleType, scheduleType,];
            } },
        type: "button",
        ...{ class: ({ active: __VLS_ctx.scheduleType === 'once' }) },
        'aria-pressed': (__VLS_ctx.scheduleType === 'once'),
    });
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    if (__VLS_ctx.scheduleType === 'once') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "field-help" },
        });
        /** @type {__VLS_StyleScopedClasses['field-help']} */ ;
    }
    if (__VLS_ctx.scheduleType === 'recurring') {
        __VLS_asFunctionalElement1(__VLS_intrinsics.fieldset, __VLS_intrinsics.fieldset)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.legend, __VLS_intrinsics.legend)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "day-picker" },
        });
        /** @type {__VLS_StyleScopedClasses['day-picker']} */ ;
        for (const [day, i] of __VLS_vFor((__VLS_ctx.dayNames))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.showAdd))
                            throw 0;
                        if (!(__VLS_ctx.scheduleType === 'recurring'))
                            throw 0;
                        return (__VLS_ctx.dayToggle(i));
                        // @ts-ignore
                        [dayNames, scheduleType, scheduleType, scheduleType, scheduleType, dayToggle,];
                    } },
                key: (day),
                type: "button",
                ...{ class: ({ active: __VLS_ctx.days.includes(i) }) },
                'aria-pressed': (__VLS_ctx.days.includes(i)),
            });
            /** @type {__VLS_StyleScopedClasses['active']} */ ;
            (day.slice(0, 1));
            // @ts-ignore
            [days, days,];
        }
    }
    if (__VLS_ctx.error) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "inline-error" },
        });
        /** @type {__VLS_StyleScopedClasses['inline-error']} */ ;
        (__VLS_ctx.error);
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "primary" },
        disabled: (__VLS_ctx.saving || !__VLS_ctx.title.trim() || (__VLS_ctx.scheduleType === 'recurring' && !__VLS_ctx.days.length) || __VLS_ctx.duration < 0),
    });
    /** @type {__VLS_StyleScopedClasses['primary']} */ ;
    (__VLS_ctx.saving ? 'Adding…' : 'Add item');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[error, error, title, duration, scheduleType, days, saving, saving,];
var __VLS_3;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    to: "body",
}));
const __VLS_8 = __VLS_7({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.showClearConfirmation) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showClearConfirmation))
                    throw 0;
                return (__VLS_ctx.showClearConfirmation = false);
                // @ts-ignore
                [showClearConfirmation, showClearConfirmation,];
            } },
        ...{ class: "modal-backdrop" },
        role: "presentation",
    });
    /** @type {__VLS_StyleScopedClasses['modal-backdrop']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
        ...{ onClick: () => { } },
        ...{ class: "timer-modal confirm-modal" },
        role: "alertdialog",
        'aria-modal': "true",
        'aria-labelledby': "clear-progress-title",
        'aria-describedby': "clear-progress-description",
    });
    /** @type {__VLS_StyleScopedClasses['timer-modal']} */ ;
    /** @type {__VLS_StyleScopedClasses['confirm-modal']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "eyebrow" },
    });
    /** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
        id: "clear-progress-title",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        id: "clear-progress-description",
    });
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "confirm-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['confirm-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showClearConfirmation))
                    throw 0;
                return (__VLS_ctx.showClearConfirmation = false);
                // @ts-ignore
                [showClearConfirmation,];
            } },
        ...{ class: "edit-cancel" },
        disabled: (__VLS_ctx.clearingProgress),
    });
    /** @type {__VLS_StyleScopedClasses['edit-cancel']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (__VLS_ctx.clearTodaysProgress) },
        ...{ class: "confirm-clear" },
        disabled: (__VLS_ctx.clearingProgress),
    });
    /** @type {__VLS_StyleScopedClasses['confirm-clear']} */ ;
    (__VLS_ctx.clearingProgress ? 'Clearing…' : 'Yes, clear progress');
}
// @ts-ignore
[clearingProgress, clearingProgress, clearingProgress, clearTodaysProgress,];
var __VLS_9;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
