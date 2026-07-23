<template>
    <div class="card" :class="cardClasses">
        <header
            v-if="showHeader || $slots.header"
            class="card-header"
            :class="[
                {
                    'card-header-danger': cardError && cardIcon,
                    'card-header-icon': cardIcon 
                },
                !cardError && cardIcon ? cardIconStyle : null,
            ]"
        >
            <slot name="header"></slot>
            <template
                v-if="showHeader"
            >
                <div v-if="cardIcon" class="card-icon">
                    <i v-if="!cardError" class="material-icons">{{ cardIcon }}</i>
                    <i v-else class="material-icons">dangerous</i>
                </div>
                <h4 v-if="cardTitle && !cardError" class="card-title">{{ cardTitle }}</h4>
                <h4 v-if="cardError" class="card-title text-danger">{{ cardError }}</h4>
                <div v-if="!advancedSearch" class="card-search" :class="{ open: searchBarOpen }">
                    <div class="form-group label-floating is-empty">
                        <i class="material-icons search-icon-left">search</i>
                        <input type="text" class="form-control filter-input" :placeholder="t('search')" autocomplete="off"
                            @keyup="setSearchTerm">
                        <a href="javascript:void(0)" class="close-search" @click="clearSearch" :data-tippy-content="t('close')">
                            <i class="material-icons">close</i>
                        </a>
                    </div>
                </div>
                <ul class="card-actions icons right-top">
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
                    <li class="dropdown" :data-tippy-content="t('showEntries')">
                        <a href="javascript:void(0)" data-bs-toggle="dropdown">
                            <i class="material-icons">more_vert</i>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-right">
                            <li @click="setPageLength(10)">
                                <a href="javascript:void(0)">10</a>
                            </li>
                            <li @click="setPageLength(25)">
                                <a href="javascript:void(0)">25</a>
                            </li>
                            <li @click="setPageLength(50)">
                                <a href="javascript:void(0)">50</a>
                            </li>
                            <li @click="setPageLength(100)">
                                <a href="javascript:void(0)">100</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </template>
        </header>
        <div class="card-body">
            <slot name="default"></slot>
            <div v-if="advancedSearch" class="toolbar" :class="{ open: searchBarOpen }">
                <form @submit.prevent="setAdvancedSearchFilters">
                    <template 
                        v-for="(column, index) in columns" 
                        :key="index"
                    >
                        <span v-if="column.searchable !== false" class="bmd-form-group">
                            <input
                                :name="column.name"
                                class="form-control advanced-filter-input"
                                :placeholder="column.displayName" autocomplete="off"
                            />
                        </span>
                    </template>
                    <button type="submit" class="btn btn-primary">{{ t('search') }}</button>
                </form>
            </div>
            <div class="table-responsive">
                <div class="dataTables_wrapper no-footer">
                    <table class="table data-table dataTable no-footer" :class="{'table-hover' : clickableRows}">
                        <thead>
                            <tr>
                                <th v-if="selectableRows">
                                    <input type="checkbox" @click="selectAllRows" ref="selectAllRows">
                                </th>
                                <template v-for="(column, index) in columns" :key="index">
                                    <th v-if="column.visible !== false"
                                        :class="[columnSortingClasses[index], column.sortable !== false ? 'sorting' : '']"
                                        @click="setSorting(index)"
                                        :style="column.width ? { width: column.width } : {}"
                                    >
                                        {{ column.displayName }}
                                    </th>
                                </template>
                                <th v-if="actions?.length" class="w-25">{{ t('actions') }}</th>
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
                                        class="btn btn-sm"
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
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div class="dataTables_info">
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
                        <div class="dataTables_paginate paging_simple_numbers user-select-none"
                            id="document-index-table_paginate">
                            <a 
                                class="paginate_button first user-select-none" 
                                :class="{ disabled: columnSettings.start == 0 }"
                                @click="setPage(1)"
                            >{{ t('first') }}</a>
                            <a class="paginate_button previous" :class="{ disabled: columnSettings.start == 0 }"
                                @click="setPage(currentPage - 1)">{{ t('previous') }}</a>

                            <span>
                                <a 
                                    v-for="(page, index) in pages"
                                    :key="index"
                                    class="paginate_button"
                                    :class="{ current: page == currentPage }"
                                    @click="setPage(page)"
                                >{{ page }}</a>
                            </span>
                            <a class="paginate_button next" :class="{ disabled: columnSettings.start >= lastPageStart }"
                                @click="setPage(currentPage + 1)">{{ t('next') }}</a>
                            <a class="paginate_button last" :class="{ disabled: columnSettings.start >= lastPageStart }"
                                @click="setPage(pageCount)">{{ t('last') }}</a>
                        </div>
                    </div>
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
                        sortDirection = this.columnSettings.order[j].dir == 'asc' ? 'sorting_asc' : 'sorting_desc';
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
        setPageLength(length) {
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
        if (this.loadDataOnInit) {
            this.loadData();
        }
    }

}
</script>

<style scoped>
.toolbar:not(.open) {
    display: none;
}

.card .card-heading {
    padding: 15px 20px;
    position: relative;
    height: 65px;
}

.card .card-search {
    position: absolute;
    top: 0;
    right: 0;
    margin: 0;
    padding: 0;
    height: 100%;
    z-index: 15;
    -webkit-transition: all 0.2s;
    -o-transition: all 0.2s;
    transition: all 0.2s;
    border: 0;
    box-shadow: none;
    width: 100%;
    display: none;
    background: #fff;
}

.card .card-search .form-group {
    margin: 0;
    padding: 0;
    height: 65px;
}

.card .card-search .search-icon-left {
    left: 15px;
    right: auto;
}

.card .card-search .close-search,
.card .card-search .search-icon-left {
    top: 50%;
    margin-top: -15px;
    line-height: 30px;
    margin-right: 10px;
    font-size: 25px;
    position: absolute;
    right: 15px;
    z-index: 99;
}

.card .card-search .form-control {
    width: 100%;
    height: 100%;
    position: absolute;
    border: none;
    box-shadow: none;
    left: 0;
    top: 0;
    margin: 0;
    font-size: 15px;
    text-indent: 45px;
    background-color: #EEF5F9;
    background-image: none;
}

.card .card-search .close-search {
    right: 15px;
    left: auto;
}

.card .card-search .search-icon-left {
    top: 50%;
    margin-top: -15px;
    line-height: 30px;
    margin-right: 10px;
    font-size: 25px;
    position: absolute;
    right: 15px;
    z-index: 99;
    width: 30px;
}

.card .card-search.open {
    display: block;
}

ul.card-actions.icons.right-top {
    right: 10px;
    top: 15px;
}

.card-heading ul.card-actions.icons {
    position: absolute;
    list-style: none;
    padding: 0;
    margin: 0;
}

ul.card-actions.icons li {
    display: inline;
}

.dataTables_wrapper .dataTables_paginate .paginate_button.current,
.dataTables_wrapper .dataTables_paginate .paginate_button.current:hover {
    background: unset;
    background-color: #00bcd4;
    border-color: #00bcd4;
    box-shadow: 0 4px 5px 0 rgba(0, 188, 212, 0.14), 0 1px 10px 0 rgba(0, 188, 212, 0.12), 0 2px 4px -1px rgba(0, 188, 212, 0.2);
}

.dataTables_wrapper .dataTables_paginate .paginate_button,
.dataTables_wrapper .dataTables_paginate .paginate_button:hover {
    background: unset;
    border: 0;
    border-color: #00bcd4;
    border-radius: 30px !important;
    -webkit-transition: all .3s;
    transition: all .3s;
    padding: 0px 11px;
    margin: 0 3px;
    min-width: 30px;
    height: 30px;
    line-height: 30px;
    color: #999999 !important;
    font-weight: 400;
    font-size: 12px;
    text-transform: uppercase;
    background: transparent;
    text-align: center;
}

.dataTables_wrapper .dataTables_paginate .paginate_button:hover {
    border: 1;
}

.card-header:first-child {
    border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;
}

.card .card-header {
    border-bottom: none;
    background: transparent;
}

.card [class*=card-header-],
.card[class*=bg-] {
    color: #ffffff;
}

.card .card-header {
    z-index: 0 !important;
}

.card [class*=card-header-] {
    margin: 0px 15px 0;
    padding: 0;
    position: relative;
}

.card [class*=card-header-] .card-icon,
.card [class*=card-header-] .card-text {
    border-radius: 3px;
    background-color: #999999;
    padding: 15px;
    margin-top: -20px;
    margin-right: 15px;
    float: left;
}

.card .card-header.card-header-icon i,
.card .card-header.card-header-text i {
    width: 33px;
    height: 33px;
    text-align: center;
    line-height: 33px;
}

.card {
    border: 0;
    margin-bottom: 30px;
    margin-top: 30px;
    border-radius: 6px;
    color: #333333;
    background: #ffffff;
    width: 100%;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
    font-size: 0.875rem;
}

.card .card-header.card-header-icon .card-title,
.card .card-header.card-header-text .card-title {
    margin-top: 15px;
    color: #3C4858;
}

.card .card-header.card-header-icon h4,
.card .card-header.card-header-text h4 {
    font-weight: 300;
}

.card .card-header .card-title {
    margin-bottom: 3px;
}

.card .card-actions {
    position: absolute;
    z-index: 1;
    top: -50px;
    width: calc(100% - 30px);
    left: 17px;
    right: 17px;
    text-align: center;
}

.card .card-actions {
    text-align: end;
}

.card ul.card-actions.icons {
    position: absolute;
    list-style: none;
    padding: 0;
    margin: 0;
    right: 10px;
    top: 15px;
}

ul.card-actions.icons.right-top {
    right: 10px;
    top: 15px;
}

ul.card-actions.icons li {
    display: inline;
    width: 100%;
    text-align: unset;
}

ul.card-actions.icons li {
    display: inline;
    width: 100%;
    text-align: unset;
}

.dropdown-menu .dropdown-item,
.dropdown-menu li>a {
    position: relative;
    width: auto;
    display: flex;
    flex-flow: nowrap;
    align-items: center;
    color: #333;
    font-weight: normal;
    text-decoration: none;
    font-size: 0.8125rem;
    border-radius: 0.125rem;
    margin: 0 0.3125rem;
    transition: all 150ms linear;
    min-width: 7rem;
    padding: 0.625rem 1.25rem;
    overflow: hidden;
    line-height: 1.42857143;
    text-overflow: ellipsis;
    word-wrap: break-word;
}

.dropdown-menu .dropdown-item,
.dropdown-menu li>a {
    padding-right: 1.5rem;
    padding-left: 1.5rem;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    float: left;
    min-width: 10rem;
    padding: 0.5rem 0;
    margin: 0.125rem 0 0;
    font-size: 1rem;
    color: #212529;
    text-align: left;
    list-style: none;
    background-color: #ffffff;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.25rem;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
}

.dropdown-menu {
    border: 0;
    display: none;
    padding: 0.3125rem 0;
    transform: scale(0);
    transform-origin: 0 0;
    will-change: transform, opacity;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
}

.dropdown-menu {
    margin: 0 !important;
}

.clickable-rows tbody tr {
    cursor: pointer;
}
</style>
