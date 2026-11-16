<template>
    <div class="vue-datatable" :class="cardClasses">
        <header
            v-if="showHeader || $slots.header"
            class="vdt-header"
            :class="[
                {
                    'vdt-header-error': cardError,
                    'vdt-header-menu-open': showPageDropdown 
                },
                !cardError && cardIcon ? cardIconStyle : null,
            ]"
        >
            <slot name="header"></slot>
            <template
                v-if="showHeader"
            >
                <div v-if="cardIcon" class="vdt-header-icon">
                    <i v-if="!cardError" class="material-icons">{{ cardIcon }}</i>
                    <i v-else class="material-icons">dangerous</i>
                </div>
                <h4 v-if="cardTitle && !cardError" class="vdt-title">{{ cardTitle }}</h4>
                <h4 v-if="cardError" class="vdt-title vdt-title-error">{{ cardError }}</h4>
                <div v-if="!advancedSearch" class="vdt-search" :class="{ open: searchBarOpen }">
                    <div class="vdt-search-field">
                        <i class="material-icons vdt-search-icon" aria-hidden="true">search</i>
                        <input type="text" class="vdt-input filter-input" :aria-label="t('search')" :placeholder="t('search')" autocomplete="off"
                            @keyup="setSearchTerm">
                        <a href="javascript:void(0)" class="vdt-search-close" :aria-label="t('close')" @click="clearSearch" :data-tippy-content="t('close')">
                            <i class="material-icons">close</i>
                        </a>
                    </div>
                </div>
                <ul class="vdt-actions">
                    <slot name="actions"></slot>
                    <li v-if="createLink">
                        <Link :href="createLink" :data-tippy-content="t('createNew')">
                        <i class="material-icons">add</i>
                        </Link>
                    </li>
                    <li>
                        <a href="javascript:void(0)" :data-tippy-content="t('search')" @click="toggleSearch">
                            <i class="material-icons">search</i>
                        </a>
                    </li>
                    <li
                        ref="pageDropdown"
                        class="vdt-page-dropdown"
                        :data-tippy-content="t('showEntries')"
                        @keydown.esc.stop="closePageDropdown"
                    >
                        <a
                            ref="pageDropdownToggle"
                            href="#"
                            role="button"
                            :aria-label="t('showEntries')"
                            :aria-expanded="showPageDropdown"
                            @click.prevent="showPageDropdown = !showPageDropdown"
                            @keydown.space.prevent="showPageDropdown = !showPageDropdown"
                        >
                            <i class="material-icons" aria-hidden="true">more_vert</i>
                        </a>
                        <ul v-if="showPageDropdown" class="vdt-page-menu">
                            <li v-for="length in [10, 25, 50, 100]" :key="length">
                                <a
                                    href="#"
                                    :aria-current="columnSettings.length === length ? 'true' : undefined"
                                    @click.prevent="setPageLength(length)"
                                >{{ length }}</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </template>
        </header>
        <div class="vdt-body">
            <slot name="default"></slot>
            <div v-if="advancedSearch" class="vdt-toolbar" :class="{ open: searchBarOpen }">
                <form @submit.prevent="setAdvancedSearchFilters">
                    <template 
                        v-for="(column, index) in columns" 
                        :key="index"
                    >
                        <span v-if="column.searchable !== false" class="vdt-filter">
                            <input
                                :name="column.name"
                                class="vdt-input advanced-filter-input"
                                :aria-label="column.displayName"
                                :placeholder="column.displayName" autocomplete="off"
                            />
                        </span>
                    </template>
                    <button type="submit" class="vdt-button vdt-button-accent">{{ t('search') }}</button>
                </form>
            </div>
            <div class="vdt-table-scroll">
                <table class="vdt-table" :class="{ 'vdt-table-clickable': clickableRows }">
                    <thead>
                        <tr>
                            <th v-if="selectableRows">
                                <input type="checkbox" @click="selectAllRows" ref="selectAllRows">
                            </th>
                            <template v-for="(column, index) in columns" :key="index">
                                <th v-if="column.visible !== false"
                                    :class="[columnSortingClasses[index], column.sortable !== false ? 'vdt-sortable' : '']"
                                    @click="setSorting(index)"
                                    :style="column.width ? { width: column.width } : {}"
                                >
                                    {{ column.displayName }}
                                </th>
                            </template>
                            <th v-if="actions?.length" class="vdt-actions-column">{{ t('actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(row, index) in rows"
                            :key="index"
                            @click="clickableRows ? $emit('row-click', row) : null"
                        >
                            <td v-if="selectableRows">
                                <input
                                    type="checkbox"
                                    :value="row.id"
                                    v-model="selectedRows"
                                    @click.stop
                                >
                            </td>
                            <template v-for="(column, index) in columns" :key="index">
                                <td
                                    v-if="column.visible !== false"
                                    :class="getCellClasses(column, row)"
                                >
                                    <template v-if="column.render">
                                        <span  v-html="column.render(row)"></span>
                                    </template>
                                    <Link 
                                        v-else-if="column.link && hyperlinkStyle === 'Link'"
                                        :href="column.link(row)"
                                        @click.stop
                                    >
                                        {{row[column.data]}}
                                    </Link>
                                    <a
                                        v-else-if="column.link && hyperlinkStyle === 'a'"
                                        :href="column.link(row)"
                                        @click.stop
                                    >
                                        {{row[column.data]}}
                                    </a>
                                    <template v-else>
                                        <span>
                                            {{row[column.data]}}
                                        </span>
                                    </template>
                                </td>
                            </template>
                            <td v-if="actions?.length">
                                <button
                                    v-for="(action, index) in actions"
                                    :key="index"
                                    type="button"
                                    class="vdt-button"
                                    :class="action.class"
                                    @click.stop="handleEmit(action.emit, row)"
                                >
                                    <i v-if="action.icon" class="material-icons">{{ action.icon }}</i> {{
                                        action.label
                                    }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="vdt-footer">
                <div class="vdt-info">
                    {{
                        t('showingRecords', {
                            first: firstRecord,
                            last: lastRecord,
                            filtered: recordsFiltered,
                        })
                    }}
                    <span v-if="recordsFiltered != recordsTotal">
                        ({{
                            t('totalRecords', {
                                total: recordsTotal,
                            })
                        }})
                    </span>
                </div>
                <div class="vdt-pagination">
                    <button type="button" :disabled="currentPage <= 1" @click="setPage(1)">
                        {{ t('first') }}
                    </button>
                    <button type="button" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)">
                        {{ t('previous') }}
                    </button>
                    <button
                        v-for="page in pages"
                        :key="page"
                        type="button"
                        :aria-current="page === currentPage ? 'page' : undefined"
                        @click="setPage(page)"
                    >{{ page }}</button>
                    <button type="button" :disabled="currentPage >= pageCount" @click="setPage(currentPage + 1)">
                        {{ t('next') }}
                    </button>
                    <button type="button" :disabled="currentPage >= pageCount" @click="setPage(pageCount)">
                        {{ t('last') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { Link } from '@inertiajs/vue3';
import { defaultVocabulary } from '../locales';

export default {
    name: "DatatableCard",
    components: {
        Link,
    },
    props: {
        locale: {
            type: String,
            required: false,
            default: 'en',
        },
        vocabulary: {
            type: Object,
            required: false,
            default: () => {
                return {};
            }
        },
        cardTitle: {
            type: String,
            required: false,
            default: null,
        },
        cardIconStyle: {
            type: String,
            required: false,
            default: 'card-header-primary',
        },
        cardIcon: {
            type: String,
            required: false,
            default: null,
        },
        cardClasses: {
            type: String,
            required: false,
            default: null,
        },
        createLink: {
            type: String,
            required: false,
            default: null,
        },
        columns: {
            type: Array,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        selectableRows: {
            type: Boolean,
            required: false,
            default: false,
        },
        order: {
            type: Array,
            required: false,
            default: () => [
                {
                    column: 0,
                    dir: 'asc',
                }
            ],
        },
        advancedSearch: {
            type: Boolean,
            required: false,
            default: false,
        },
        loadDataOnInit: {
            type: Boolean,
            required: false,
            default: true,
        },
        requestQueryParams: {
            type: Object,
            required: false,
            default: () => {
                return {};
            }
        },
        actions: {
            type: Array,
            required: false,
        },
        clickableRows: {
            type: Boolean,
            required: false,
            default: false,
        },
        hyperlinkStyle: {
            // either Link or a tag
            type: String,
            required: false,
            default: 'Link',
        },
        pageLength: {
            type: Number,
            required: false,
            default: 10,
        },
        showHeader: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    emits: ['row-click'],
    data() {
        return {
            searchBarOpen: false,
            showPageDropdown: false,
            rows: [],
            columnSettings: {},
            searchTerm: '',
            recordsTotal: 0,
            recordsFiltered: 0,
            selectedRows: [],
            cardError: null,
            searchTimer: null,
        }
    },
    watch: {
        selectedRows: function (val, oldVal) {
            if (!this.selectableRows) {
                return;
            }

            if (val.length === this.rows.length && val.length > 0) {
                this.$refs.selectAllRows.indeterminate = false;
                this.$refs.selectAllRows.checked = true;
            } else if (val.length === 0) {
                this.$refs.selectAllRows.indeterminate = false;
                this.$refs.selectAllRows.checked = false;
            } else {
                this.$refs.selectAllRows.indeterminate = true;
            }
        }
    },
    computed: {
        firstRecord() {
            return this.recordsFiltered === 0
                ? 0
                : this.columnSettings.start + 1;
        },
        lastRecord() {
            return this.columnSettings.start + this.rows.length;
        },
        currentPage() {
            return Math.ceil(this.columnSettings.start / this.columnSettings.length) + 1;
        },
        pageCount() {
            return Math.ceil(this.recordsFiltered / this.columnSettings.length);
        },
        lastPageStart() {
            return (this.pageCount - 1) * this.columnSettings.length;
        },
        columnSortingClasses() {
            let classes = [];
            if (!this.columnSettings.order) {
                return classes;
            }

            for (let i = 0; i < this.columns.length; i++) {
                let sortDirection = '';
                for (let j = 0; j < this.columnSettings.order.length; j++) {
                    if (this.columnSettings.order[j].column == i) {
                        sortDirection = this.columnSettings.order[j].dir == 'asc' ? 'vdt-sort-ascending' : 'vdt-sort-descending';
                    }
                }
                classes.push(sortDirection);
            }
            return classes;
        },
        pages() {
            let pages = [];
            let start = this.currentPage - 2;
            let end = this.currentPage + 2;
            if (start < 1) {
                start = 1;
                end = 5;
            }
            if (end > this.pageCount) {
                start = this.pageCount - 4;
                end = this.pageCount;
            }
            if (start < 1) {
                start = 1;
            }
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        },
    },
    methods: {
        /**
         * Resolve classes for a cell based on column definition and row data.
         *
         * column.classes supports:
         *  1) String => always applied, e.g. "text-end bg-light"
         *  2) Array of rules => [{ min, max, class, valueKey? }]
         *     - valueKey (optional) lets you read a different field than column.data
         *     - min/max are numeric thresholds (inclusive)
         */
        getCellClasses(column, row) {
            const classes = [];

            if (!column.classes) {
                return classes;
            }

            // Simple string: always apply
            if (typeof column.classes === 'string') {
                classes.push(column.classes);
                return classes;
            }

            // Array of conditional rules
            if (Array.isArray(column.classes)) {
                const baseValue = row[column.data];

                column.classes.forEach((rule) => {
                    if (!rule || !rule.class) {
                        return;
                    }

                    // which value to inspect (defaults to column.data)
                    const raw = rule.valueKey ? row[rule.valueKey] : baseValue;

                    // try to parse numeric (strip % if needed)
                    let num = raw;
                    if (typeof num === 'string') {
                        num = parseFloat(num.replace('%', '').trim());
                    }

                    if (typeof num !== 'number' || isNaN(num)) {
                        return;
                    }

                    const min = rule.min !== undefined ? rule.min : -Infinity;
                    const max = rule.max !== undefined ? rule.max : Infinity;

                    if (num >= min && num <= max) {
                        classes.push(rule.class);
                    }
                });
            }

            return classes;
        },
        handleEmit(emit, row) {
            this.$emit(emit, row);
        },
        refresh() {
            this.initColumnSettings();
            this.searchBarOpen = false;
            if (this.loadDataOnInit) {
                this.loadData();
            } else {
                this.rows = [];
            }

            // clear selected rows
            this.selectedRows = [];

            // clear search bar
            if (!this.advancedSearch) {
                this.$el.querySelector('.filter-input').value = '';
            }
            // clear advanced search inputs
            this.$el.querySelectorAll('.advanced-filter-input').forEach((input) => {
                input.value = '';
            });
        },

        toggleSearch() {
            if (!this.advancedSearch) {
                this.searchBarOpen = true;
            }

            if (this.advancedSearch) {
                this.searchBarOpen = !this.searchBarOpen;
            }
        },
        clearSearch() {
            clearTimeout(this.searchTimer);

            this.searchBarOpen = false;

            const input = this.$el.querySelector('.filter-input');

            if (input) {
                input.value = '';
            }

            this.columnSettings.search.value = '';
            this.columnSettings.start = 0;
            this.loadData();
        },
        setAdvancedSearchFilters() {
            this.columnSettings.start = 0;

            this.columnSettings.columns.forEach(column => {
                if (!column.searchable) {
                    return;
                }

                const input = this.$el.querySelector(
                    `input[name="${CSS.escape(column.name)}"]`
                );

                column.search.value = input?.value ?? '';
            });

            this.loadData();
        },
        loadData() {
            this.columnSettings.draw++;
            this.clearSelectedRows();
            const params = {
                ...this.requestQueryParams,
                ...this.columnSettings,
            };
            axios.get(this.url, { params: params }).then(response => {
                if (response.data.error) {
                    this.cardError = this.t('loadingError');
                    console.error(response.data.error);
                    return;
                }

                this.cardError = null;
                this.rows = response.data.data;
                this.recordsTotal = response.data.recordsTotal;
                this.recordsFiltered = response.data.recordsFiltered;
            })
                .catch(error => {
                    this.cardError =
                        error.response?.data?.message ??
                        this.t('loadingError');

                    console.error(error);
                });
        },
        initColumnSettings() {
            this.columnSettings = {
                draw: 0,
                columns: this.columns.map((column, index) => {
                    return {
                        data: column.data,
                        name: column.name,
                        // if searchable is not set, default to true
                        searchable: column.searchable === undefined ? true : column.searchable,
                        sortable: column.sortable === undefined ? true : column.sortable,
                        visible: column.visible === undefined ? true : column.visible,
                        search: {
                            value: '',
                            regex: false,
                        }
                    }
                }),
                order: this.order.map(item => ({ ...item })),
                start: 0,
                length: this.pageLength,
                search: {
                    value: '',
                    regex: false,
                },
            }
        },
        closePageDropdown() {
            if (!this.showPageDropdown) {
                return;
            }

            this.showPageDropdown = false;
            this.$refs.pageDropdownToggle?.focus();
        },
        handlePageDropdownOutsideClick(event) {
            if (this.showPageDropdown && !this.$refs.pageDropdown?.contains(event.target)) {
                this.showPageDropdown = false;
            }
        },
        setPageLength(length) {
            this.closePageDropdown();
            this.columnSettings.length = length;
            this.columnSettings.start = 0;
            this.loadData();
        },
        setPage(page) {
            if (page < 1 || page > this.pageCount) {
                return;
            }
            this.columnSettings.start = (page - 1) * this.columnSettings.length;
            this.loadData();
        },
        setSearchTerm() {
            clearTimeout(this.searchTimer);

            this.searchTimer = setTimeout(() => {
                const input = this.$el.querySelector('.filter-input');

                this.columnSettings.search.value =
                    input?.value ?? '';

                this.columnSettings.start = 0;
                this.loadData();
            }, 500);
        },
        setSorting(index) {
            // if column is not sortable, do nothing
            if (!this.columnSettings.columns[index].sortable) {
                return;
            }
            // console.log('sorting');
            // // if column is already sorted, reverse sort direction
            if (this.columnSettings.order[0].column == index) {
                this.columnSettings.order[0].dir = this.columnSettings.order[0].dir == 'asc' ? 'desc' : 'asc';
            } else {
                // if column is not sorted, set it as first sort column
                this.columnSettings.order = [
                    {
                        column: index,
                        dir: 'asc',
                    }
                ];
            }
            this.loadData();
        },
        selectAllRows() {
            if (this.selectedRows.length == this.rows.length) {
                this.selectedRows = [];
            } else {
                this.selectedRows = this.rows.map((row) => {
                    return row.id;
                });
            }
        },
        clearSelectedRows() {
            this.selectedRows = [];
        },
        filterColumns(params) {
            // param example
            // [
            //     {
            //         name: 'name',
            //         value: 'John',
            //     },
            //     {
            //         name: 'email',
            //         value: 'john@example',
            //     },
            // ]

            // set search term for each column if searchable
            this.columnSettings.columns.forEach((column, index) => {
                if (column.searchable) {
                    column.search.value = '';
                    params.forEach((param) => {
                        if (param.name == column.name) {
                            column.search.value = param.value;
                        }
                    });
                }
            });
            
            this.columnSettings.start = 0;
            this.loadData();
        },
        getSelectedRows() {
            return this.selectedRows;
        },
        t(key, replacements = {}) {
            const packageLocale =
                defaultVocabulary[this.locale] ??
                defaultVocabulary.en;

            const customLocale =
                this.vocabulary[this.locale] ??
                this.vocabulary.en;

            let translation =
                customLocale?.[key] ??
                packageLocale?.[key] ??
                defaultVocabulary.en[key] ??
                key;

            Object.entries(replacements).forEach(([name, value]) => {
                translation = translation.replaceAll(
                    `{${name}}`,
                    String(value)
                );
            });

            return translation;
        },
    },
    created() {
        this.initColumnSettings();
    },
    mounted() {
        document.addEventListener('click', this.handlePageDropdownOutsideClick);
        if (this.loadDataOnInit) {
            this.loadData();
        }
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handlePageDropdownOutsideClick);
    },
}
</script>

<style scoped>
.vue-datatable {
    position: relative;
    isolation: isolate;
    inline-size: 100%;
    min-inline-size: 0;
    margin-block: var(--vdt-margin-block, 1.875rem);
    border: 1px solid var(--vdt-border, color-mix(in srgb, CanvasText 18%, transparent));
    border-radius: var(--vdt-radius, 0.375rem);
    background: var(--vdt-surface, Canvas);
    color: var(--vdt-text, CanvasText);
    box-shadow: var(--vdt-shadow, 0 1px 4px rgb(0 0 0 / 15%));
    font-size: var(--vdt-font-size, 0.875rem);
    text-align: start;
}

.vdt-header {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    min-block-size: 4rem;
    padding: var(--vdt-padding, 1rem);
}

.vdt-header-menu-open {
    z-index: 2;
}

.vdt-header-icon {
    display: grid;
    flex: none;
    place-items: center;
    inline-size: 3.75rem;
    block-size: 3.75rem;
    margin-block-start: -2.5rem;
    border-radius: var(--vdt-radius, 0.375rem);
    background: var(--vdt-icon-surface, var(--vdt-accent, #9c27b0));
    color: var(--vdt-accent-text, #fff);
}

.vdt-header-error .vdt-header-icon {
    background: var(--vdt-error-surface, #b42318);
}

.vdt-title {
    margin: 0;
    color: inherit;
    font-size: 1.125rem;
    font-weight: 500;
    overflow-wrap: anywhere;
}

.vdt-title-error {
    color: var(--vdt-error-text, light-dark(#b42318, #ffb4ab));
}

.vdt-actions {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0;
    margin: 0;
    margin-inline-start: auto;
    list-style: none;
}

.vdt-actions > li > a,
.vdt-search-close {
    display: inline-grid;
    place-items: center;
    min-inline-size: 2rem;
    min-block-size: 2rem;
    border-radius: var(--vdt-radius, 0.375rem);
    color: var(--vdt-link, LinkText);
    text-decoration: none;
}

.vdt-actions > li > a:hover,
.vdt-search-close:hover {
    background: var(--vdt-hover-surface, color-mix(in srgb, currentColor 12%, transparent));
}

.vdt-search {
    position: absolute;
    z-index: 3;
    inset: 0;
    display: none;
    padding: 0.5rem var(--vdt-padding, 1rem);
    border-radius: var(--vdt-radius, 0.375rem);
    background: var(--vdt-search-surface, var(--vdt-surface, Canvas));
    color: var(--vdt-search-text, var(--vdt-text, CanvasText));
}

.vdt-search.open,
.vdt-search-field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.vdt-search-field {
    inline-size: 100%;
}

.vdt-search-icon,
.vdt-search-close {
    flex: none;
}

.vdt-input {
    min-inline-size: 0;
    padding: 0.5rem 0.625rem;
    border: 1px solid var(--vdt-border, color-mix(in srgb, CanvasText 18%, transparent));
    border-radius: var(--vdt-radius, 0.375rem);
    background: var(--vdt-surface, Canvas);
    color: var(--vdt-text, CanvasText);
    font: inherit;
}

.vdt-input::placeholder {
    color: var(--vdt-muted-text, GrayText);
}

.vdt-search .vdt-input {
    flex: 1;
    background: transparent;
    color: inherit;
}

.vdt-body {
    padding: 0 var(--vdt-padding, 1rem) var(--vdt-padding, 1rem);
}

.vdt-toolbar {
    margin-block-end: 0.75rem;
}

.vdt-toolbar:not(.open) {
    display: none;
}

.vdt-toolbar form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
}

.vdt-filter,
.vdt-filter .vdt-input {
    min-inline-size: 0;
    max-inline-size: 100%;
}

.vdt-table-scroll {
    overflow-x: auto;
}

.vdt-table {
    inline-size: 100%;
    border-collapse: collapse;
    color: inherit;
}

.vdt-table :is(th, td) {
    padding: var(--vdt-cell-padding, 0.625rem 0.5rem);
    border-block-end: 1px solid var(--vdt-border, color-mix(in srgb, CanvasText 18%, transparent));
    text-align: inherit;
    vertical-align: middle;
}

.vdt-table th {
    font-weight: 600;
}

.vdt-table .vdt-sortable {
    cursor: pointer;
}

.vdt-sortable::after {
    content: '↕';
    margin-inline-start: 0.375rem;
    color: var(--vdt-muted-text, GrayText);
}

.vdt-sortable.vdt-sort-ascending::after { content: '↑'; }
.vdt-sortable.vdt-sort-descending::after { content: '↓'; }

.vdt-table-clickable tbody tr {
    cursor: pointer;
}

.vdt-table-clickable tbody tr:hover {
    background: var(--vdt-hover-surface, color-mix(in srgb, currentColor 8%, transparent));
}

.vdt-table a {
    color: var(--vdt-link, LinkText);
}

.vdt-actions-column {
    inline-size: 25%;
}

.vdt-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.625rem;
    margin-block-start: 0.75rem;
}

.vdt-info {
    color: var(--vdt-muted-text, GrayText);
}

.vdt-pagination {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
}

.vdt-button,
.vdt-pagination button {
    min-block-size: 2rem;
    padding: 0.25rem 0.625rem;
    border: 0;
    border-radius: var(--vdt-radius, 0.375rem);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.vdt-button {
    border: 1px solid var(--vdt-border, color-mix(in srgb, CanvasText 18%, transparent));
}

.vdt-pagination button {
    min-inline-size: 2rem;
    border-radius: 999px;
    font-size: 0.75rem;
    text-transform: uppercase;
}

.vdt-pagination button:disabled {
    color: var(--vdt-muted-text, GrayText);
    cursor: default;
    opacity: 0.65;
}

.vdt-pagination button:hover:not(:disabled),
.vdt-button:hover:not(:disabled) {
    background: var(--vdt-hover-surface, color-mix(in srgb, currentColor 12%, transparent));
}

.vdt-button-accent,
.vdt-button-accent:hover:not(:disabled),
.vdt-pagination button[aria-current="page"],
.vdt-pagination button[aria-current="page"]:hover {
    background: var(--vdt-accent, #9c27b0);
    color: var(--vdt-accent-text, #fff);
}

.vdt-page-dropdown {
    position: relative;
}

.vdt-page-menu {
    position: absolute;
    inset-block-start: 100%;
    inset-inline-end: 0;
    min-inline-size: 10rem;
    padding: 0.3125rem;
    margin: 0;
    border: 1px solid var(--vdt-border, color-mix(in srgb, CanvasText 18%, transparent));
    border-radius: var(--vdt-radius, 0.375rem);
    background: var(--vdt-menu-surface, var(--vdt-surface, Canvas));
    color: var(--vdt-menu-text, var(--vdt-text, CanvasText));
    box-shadow: var(--vdt-shadow, 0 1px 4px rgb(0 0 0 / 15%));
    list-style: none;
}

.vdt-page-menu a {
    display: block;
    padding: 0.625rem 1.25rem;
    border-radius: var(--vdt-radius, 0.375rem);
    color: inherit;
    text-decoration: none;
}

.vdt-page-menu a:hover,
.vdt-page-menu a:focus-visible,
.vdt-page-menu a[aria-current="true"] {
    background: var(--datatable-page-option-active-bg, var(--vdt-accent, #9c27b0));
    color: var(--datatable-page-option-active-color, var(--vdt-accent-text, #fff));
}

.vue-datatable :is(a, button, input):focus-visible {
    outline: 2px solid var(--vdt-focus, Highlight);
    outline-offset: 2px;
}
</style>
