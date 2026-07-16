# Vue DatatableCard

`DatatableCard` is a server-side Vue 3 datatable component designed for Laravel applications using a DataTables-compatible backend, such as [`yajra/laravel-datatables-oracle`](https://yajrabox.com/docs/laravel-datatables).

It supports server-side pagination, sorting, global and per-column search, row selection, clickable rows, custom row actions, localized interface text, Inertia or native links, custom cell rendering, and conditional cell classes.

## Requirements

- Vue 3
- Axios
- `@inertiajs/vue3`
- A server endpoint that accepts DataTables-style query parameters and returns a compatible response

The component also uses Bootstrap/Material-style classes and Material Icons in its default markup.

## Installation

```bash
npm install @sulzanoks/vue-datatable
```

## Basic usage

```vue
<template>
    <DatatableCard
        ref="datatable"
        card-title="Users"
        card-icon="people"
        url="/users/datatable"
        :columns="columns"
        :order="[{ column: 0, dir: 'asc' }]"
        :page-length="25"
        clickable-rows
        @row-click="openUser"
    />
</template>

<script>
import DatatableCard from '@sulzanoks/vue-datatable';
import '@sulzanoks/vue-datatable/dist/style.css';

export default {
    components: {
        DatatableCard,
    },

    data() {
        return {
            columns: [
                {
                    data: 'id',
                    name: 'users.id',
                    displayName: 'ID',
                    searchable: false,
                    width: '80px',
                },
                {
                    data: 'name',
                    name: 'users.name',
                    displayName: 'Name',
                    link: row => `/users/${row.id}`,
                },
                {
                    data: 'email',
                    name: 'users.email',
                    displayName: 'Email',
                },
            ],
        };
    },

    methods: {
        openUser(row) {
            window.location.href = `/users/${row.id}`;
        },
    },
};
</script>
```

## Props

| Prop | Type | Default | Description |
|---|---|---:|---|
| `url` | `String` | required | Server endpoint used to load table data. |
| `columns` | `Array` | required | Column definitions. See [Column configuration](#column-configuration). |
| `locale` | `String` | `'en'` | Locale used for built-in interface text. |
| `vocabulary` | `Object` | `{}` | Custom translations grouped by locale. |
| `cardTitle` | `String` | `null` | Card title. |
| `cardIcon` | `String` | `null` | Material Icon name displayed in the header. |
| `cardIconStyle` | `String` | `'card-header-primary'` | CSS class applied to the icon header when there is no error. |
| `cardClasses` | `String` | `null` | Additional classes applied to the root card. |
| `createLink` | `String` | `null` | URL used by the header create button. It is rendered as an Inertia `<Link>`. |
| `selectableRows` | `Boolean` | `false` | Enables row checkboxes. Rows must contain an `id` value. |
| `order` | `Array` | `[{ column: 0, dir: 'asc' }]` | Initial DataTables sorting configuration. |
| `advancedSearch` | `Boolean` | `false` | Enables one search field for every searchable column. |
| `loadDataOnInit` | `Boolean` | `true` | Loads data when the component mounts. |
| `requestQueryParams` | `Object` | `{}` | Extra query parameters included with every server request. |
| `actions` | `Array` | `undefined` | Row action button definitions. |
| `clickableRows` | `Boolean` | `false` | Emits `row-click` when a table row is clicked. |
| `hyperlinkStyle` | `String` | `'Link'` | Controls column link rendering. Supported values are `'Link'` and `'a'`. |
| `pageLength` | `Number` | `10` | Initial number of rows per page. |

In templates, camelCase props can be passed using kebab-case, for example `page-length`, `clickable-rows`, and `request-query-params`.

## Column configuration

Each entry in `columns` supports the following properties:

| Property | Type | Default | Description |
|---|---|---:|---|
| `data` | `String` | required | Row property displayed in the cell and sent as the DataTables column `data` value. |
| `name` | `String` | recommended | Server-side column name. Required for advanced search and normally used by the backend for filtering and sorting. |
| `displayName` | `String` | required | Column heading and advanced-search placeholder. |
| `searchable` | `Boolean` | `true` | Set to `false` to disable searching for the column. |
| `sortable` | `Boolean` | `true` | Set to `false` to disable sorting for the column. |
| `visible` | `Boolean` | `true` | Set to `false` to hide the column while keeping it in the request configuration. |
| `width` | `String` | — | CSS width applied to the heading, such as `'120px'` or `'20%'`. |
| `link` | `Function` | — | Receives the current row and returns the destination URL. |
| `render` | `Function` | — | Receives the current row and returns HTML rendered with `v-html`. |
| `classes` | `String \| Array` | — | Static classes or conditional numeric class rules for the table cell. |

### Column links

Define `link` as a function that receives the current row:

```js
{
    data: 'name',
    name: 'users.name',
    displayName: 'Name',
    link: row => `/users/${row.id}`,
}
```

By default, links use Inertia's `<Link>` component:

```vue
<DatatableCard hyperlink-style="Link" />
```

Use a native anchor instead when a full browser navigation or download is required:

```vue
<DatatableCard hyperlink-style="a" />
```

The previous `linkParams` and Ziggy-based `generateLink()` API is no longer supported. Generate the URL in the `link(row)` callback or return a ready-to-use URL from the backend:

```js
{
    data: 'invoice_number',
    name: 'invoices.invoice_number',
    displayName: 'Invoice',
    link: row => row.url,
}
```

### Custom cell rendering

Use `render(row)` to return custom HTML:

```js
{
    data: 'status',
    name: 'status',
    displayName: 'Status',
    render: row => `<span class="badge bg-success">${row.status}</span>`,
}
```

`render()` output is inserted using `v-html`. Only return trusted or sanitized HTML. When `render` is defined, it takes precedence over `link` and the normal text value.

### Static cell classes

```js
{
    data: 'total',
    name: 'total',
    displayName: 'Total',
    classes: 'text-end fw-bold',
}
```

### Conditional cell classes

`classes` can also be an array of numeric rules. The `min` and `max` limits are inclusive.

```js
{
    data: 'difference',
    name: 'difference',
    displayName: 'Difference',
    classes: [
        { max: -0.01, class: 'text-danger' },
        { min: 0, max: 0, class: 'text-muted' },
        { min: 0.01, class: 'text-success' },
    ],
}
```

Use `valueKey` to evaluate another row property:

```js
{
    data: 'hourly_rate',
    name: 'hourly_rate',
    displayName: 'Hourly rate',
    classes: [
        {
            valueKey: 'rate_difference',
            max: -0.01,
            class: 'bg-danger-subtle',
        },
    ],
}
```

String values are parsed as numbers, and a trailing percent sign is ignored during parsing.

## Localization

The component translates its interface using the `locale` and `vocabulary` props.

```vue
<DatatableCard
    locale="lv"
    :vocabulary="vocabulary"
    :columns="columns"
    url="/users/datatable"
/>
```

```js
export default {
    data() {
        return {
            vocabulary: {
                lv: {
                    search: 'Meklēt',
                    close: 'Aizvērt',
                    createNew: 'Izveidot',
                    showEntries: 'Rādīt ierakstu skaitu',
                    actions: 'Darbības',
                    showingRecords: 'Rāda {first}. līdz {last}. no {filtered} ierakstiem',
                    totalRecords: 'kopā {total} ieraksti',
                    first: 'Pirmā',
                    previous: 'Iepriekšējā',
                    next: 'Nākamā',
                    last: 'Pēdējā',
                    loadingError: 'Neizdevās ielādēt datus',
                },
            },
        };
    },
};
```

### Translation keys

| Key | Used for |
|---|---|
| `search` | Search placeholder, search button, and tooltip |
| `close` | Close-search tooltip |
| `createNew` | Create-link tooltip |
| `showEntries` | Page-length menu tooltip |
| `actions` | Row actions column heading |
| `showingRecords` | Record-range text; supports `{first}`, `{last}`, and `{filtered}` |
| `totalRecords` | Unfiltered total; supports `{total}` |
| `first` | First-page button |
| `previous` | Previous-page button |
| `next` | Next-page button |
| `last` | Last-page button |
| `loadingError` | Generic data-loading error |

Translation lookup order is:

1. `vocabulary[locale][key]`
2. `vocabulary.en[key]`
3. package defaults for the selected locale
4. package English default
5. the translation key itself

The locale key must match the `locale` prop exactly.

## Advanced search

Enable per-column inputs with:

```vue
<DatatableCard advanced-search />
```

An input is generated for each column where `searchable !== false`. Each searchable column should have a unique `name` value.

The search toolbar is opened and closed with the header search icon. Submitting the form resets pagination to the first page and reloads the data.

## Global search

When `advancedSearch` is disabled, the component displays a global search field. Input is debounced by 500 milliseconds before a new request is sent.

## Row selection

```vue
<DatatableCard
    ref="datatable"
    selectable-rows
    :columns="columns"
    url="/users/datatable"
/>
```

Rows must include an `id` property. Selection applies to the currently loaded page and is cleared whenever data is reloaded.

Read the selected IDs through the public method:

```js
const selectedIds = this.$refs.datatable.getSelectedRows();
```

## Clickable rows

```vue
<DatatableCard
    clickable-rows
    @row-click="handleRowClick"
/>
```

```js
methods: {
    handleRowClick(row) {
        console.log(row);
    },
}
```

Clicks on selection checkboxes, column links, and action buttons do not trigger `row-click`.

## Row actions

Define one or more buttons using the `actions` prop:

```vue
<DatatableCard
    :columns="columns"
    :actions="actions"
    url="/users/datatable"
    @edit="editUser"
    @remove="removeUser"
/>
```

```js
export default {
    data() {
        return {
            actions: [
                {
                    emit: 'edit',
                    icon: 'edit',
                    label: 'Edit',
                    class: 'btn-primary',
                },
                {
                    emit: 'remove',
                    icon: 'delete',
                    label: 'Delete',
                    class: 'btn-danger',
                },
            ],
        };
    },

    methods: {
        editUser(row) {
            // Handle edit action
        },

        removeUser(row) {
            // Handle remove action
        },
    },
};
```

Each action supports:

| Property | Type | Description |
|---|---|---|
| `emit` | `String` | Event name emitted with the current row as its payload. |
| `icon` | `String` | Optional Material Icon name. |
| `label` | `String` | Optional button label. |
| `class` | `String \| Object \| Array` | Classes passed to the button's Vue `:class` binding. |

The actions column is only rendered when the array contains at least one item.

## Extra request parameters

Use `requestQueryParams` to append application-specific filters:

```vue
<DatatableCard
    :request-query-params="{
        organization_id: organizationId,
        active: 1,
    }"
/>
```

These values are merged into the same Axios request as the DataTables parameters.

## Slots

### `header`

Adds custom content at the beginning of the card header. The built-in icon, title, error text, and controls are still rendered.

```vue
<DatatableCard>
    <template #header>
        <span class="text-muted">Updated moments ago</span>
    </template>
</DatatableCard>
```

### `actions`

Adds custom controls before the built-in create, search, and page-length controls.

```vue
<DatatableCard>
    <template #actions>
        <li>
            <button type="button" @click="exportRows">Export</button>
        </li>
    </template>
</DatatableCard>
```

### Default slot

Adds content inside the card body above the search toolbar and table.

```vue
<DatatableCard>
    <div class="alert alert-info">
        Select a row to view details.
    </div>
</DatatableCard>
```

## Public methods

Assign a template ref before calling public methods:

```vue
<DatatableCard ref="datatable" />
```

### `refresh()`

Resets sorting, filters, pagination, selection, and search inputs. When `loadDataOnInit` is `true`, it reloads data; otherwise it clears the rows.

```js
this.$refs.datatable.refresh();
```

### `filterColumns(params)`

Sets server-side search values for named columns, resets pagination, and reloads data.

```js
this.$refs.datatable.filterColumns([
    {
        name: 'serial_number',
        value: this.uniqueId,
    },
    {
        name: 'product_name',
        value: this.productName,
    },
]);
```

Columns not included in `params` have their current search value cleared.

### `getSelectedRows()`

Returns the selected row IDs from the currently loaded page:

```js
const selectedIds = this.$refs.datatable.getSelectedRows();
```

## Events

| Event | Payload | Description |
|---|---|---|
| `row-click` | Current row object | Emitted when `clickableRows` is enabled and the user clicks a row. |
| Action-defined event | Current row object | Emitted when a configured row action is clicked. The event name comes from `action.emit`. |

## Server-side API

The component sends DataTables-style parameters through an Axios `GET` request, including:

- `draw`
- `columns`
- `order`
- `start`
- `length`
- `search`
- values from `requestQueryParams`

The endpoint should return at least:

```json
{
    "data": [],
    "recordsTotal": 0,
    "recordsFiltered": 0
}
```

The component also recognizes an `error` field in a successful response:

```json
{
    "error": "Unable to load records"
}
```

When an Axios request fails, the component displays the response message when available, otherwise it uses the localized `loadingError` text.

## Compatibility

The component is designed for Laravel endpoints powered by [`yajra/laravel-datatables-oracle`](https://yajrabox.com/docs/laravel-datatables), but it can work with any backend that accepts and returns the same request/response structure.

## Security

The `render(row)` column callback uses Vue's `v-html`. Never insert unsanitized user-controlled content through `render()`.

## License

This project is open-source software licensed under the MIT License. See [LICENSE](LICENSE) for details.
