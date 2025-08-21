# DatatableCard Component

DatatableCard is a custom Vue.js component designed to provide a flexible and customizable datatable for your web applications. It is built from scratch, inspired by the Bootstrap datatable, but with added features to support Vue.js style links and row selection.

## Installation

You can install the DatatableCard component using npm:

```bash
npm install @sulzanoks/vue-datatable
```

## Usage

To use the DatatableCard component in your Vue.js application, you can import it and include it in your component's template. Here's an example of how to use it:

```vue
<template>
  <div>
    <datatable-card
      :card-title="cardTitle"
      :columns="columns"
      :url="dataUrl"
    >
    </datatable-card>
  </div>
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
      cardTitle: 'My Datatable',
      columns: [
        // Define your datatable columns here
        // Example: { data: 'id', name: 'ID', sortable: true, searchable: true }
      ],
      dataUrl: '/api/data', // Replace with your data endpoint URL
    };
  },
};
</script>
```

## Props

The DatatableCard component accepts the following props:

- `cardTitle` (String): The title for the datatable card.
- `clickable-rows` (Boolean, optional, default: false): Set to true to enable `row-click` event.
- `columns` (Array): An array of column objects defining the datatable columns.
  - `data` (String): The key to access the data for this column in the API response.
  - `displayName` (String): The display name or label for this column.
  - `name` (String): The unique name or identifier for this column.
  - `searchable` (Boolean, optional, default: true): Set to `false` to disable searching for this column.
  - `sortable` (Boolean, optional, default: true): Set to `false` to disable sorting for this column.
  - `visible` (Boolean, optional, default: true): Set to `false` to remove column from table.
  - `width` (String, optional): Set solumn to width specified css param.
  - `linkParams` (Object, optional): Defines link parameters for generating Vue.js style links.
    - `name` (String): The name of the Vue.js route to navigate to when clicking the link.
    - `resourceIds` (Array): An array of resource IDs to use in generating the link. Replace with actual resource IDs.
    - `query` (Object, optional): object of attributes to include in link query params
- `url` (String): The URL for fetching datatable data.
- `selectableRows` (Boolean): Set to `true` to enable row selection. For now only works if you have a, `id` column in your data set. 
- `order` (Array): The initial column sorting order. example: `[{ column: 0, dir: 'asc' }]`
- `advancedSearch` (Boolean): Set to `true` to enable advanced search, which generates an individual search input for each searchable column.
- `loadDataOnInit` (Boolean): Set to `true` to load data when the component is initialized.
- `cardIconStyle` (String, optional, default: 'card-header-primary'. There are no other options): The CSS class to apply to the card's header for icon styling.
- `cardIcon` (String, optional, default: null): The name of an icon from [Google Icons](https://fonts.google.com/icons) to display in the card's header. Provide the icon name without any additional markup, such as `<i>` tags. For example, if you want to use the "account_circle" icon, set this prop to `'account_circle'`. If not specified, no icon will be displayed in the card's header.
- `cardClasses` (String, optional, default: null): Additional CSS classes to apply to the card.
- `createLink` (String, optional, default: null): A link or URL to navigate to when clicking a "Create" button or link within the card.
- `requestQueryParams` (Object, optional): additional request query parameters to include when loading data from server.
- `actions` (Array, optional): Array of action objects defining action buttons for each row.
  - `emit` (String, required): name of event to emit upon click
  - `icon` (String, optional): The name of an icon from [Google Icons](https://fonts.google.com/icons) to display inside button.
  - `label` (String, optional): Text to display inside button.
  - `class` (String, optional): CSS class to apply to button.

## Link Parameters (`linkParams`)

The `generateLink` method now supports **two modes** for building links:

### 1. Laravel Route Name (default / original behavior)

Use when you want to leverage Laravel named routes via Ziggy’s `route()` helper.

```js
{
  data: 'title',
  linkParams: {
    name: 'users.show',       // Laravel route name
    resourceIds: ['id'],      // values taken from the row
    query: { tab: 'info' }    // optional query params
  }
}
```

➡️ If `row.id = 5`, this builds:
```
/users/5?tab=info
```

### 2. Link Template

Use when you want full control over the URL structure without relying on Laravel route names.

#### Object Form
```js
{
  data: 'title',
  linkParams: {
    template: '/users/{id}/posts/{post_id}',
    params: { post_id: 'latest' }, // override or add interpolation values
    query: { filter: 'active' }    // optional query params
  }
}
```
➡️ If `row.id = 5`, this builds:
```
/users/5/posts/latest?filter=active
```

#### String Shorthand
```js
{
  data: 'title',
  linkParams: '/users/{id}'
}
```
➡️ If `row.id = 5`, this builds:
```
/users/5
```

### Template Placeholders

Templates support both styles:
- `{key}` → `/users/{id}`
- `:key` → `/users/:id`

Both will be replaced with the row’s value (or overridden via `params`).

### Notes
- If both `params` and row values define the same key, `params` takes precedence.
- Query parameters (`query`) are supported in both modes.
- If you just need a simple route name, use **mode 1**; if you want custom URLs, use **mode 2**.

## Internal Methods

These methods are meant to be used by component internally, but maybe you can find use for them

- `toggleSearch()`: Toggle the search input.
- `clearSearch()`: Clear the search bar and reload data.
- `setAdvancedSearchFilters()`: Set advanced search filters based in input element values and reload data.
- `loadData()`: Load datatable data.
- `initColumnSettings()`: Initialize column settings.
- `setPageLength(length)`: Set the number of rows per page and reload data.
- `setPage(page)`: Set the current page and reload data.
- `setSearchTerm()`: Set the full text search term for basic search on all columns and reload data.
- `setSorting(index)`: Set the sorting order for a column and reload data.
- `generateLink(linkParams, row)`: Generate a link based on parameters and row data.
- `selectAllRows()`: Select or deselect all rows.
- `clearSelectedRows()`: Clear the selected rows.

## Methods
- `getSelectedRows()`: Returns array of selected rows
- `filterColumns(params)`: Filter columns based on parameters and reload data.
```javascript
    this.$refs.myDataTable.filterColumns([
        {
            name: 'serial_number',
            value: this.uniqueId,
        },
        {
            name: 'product_name',
            value: this.productName,
        }
    ]);
```
- `refresh()`: Clears all sorting and filters, reloads or clears data based on `loadDataOnInit` prop.

## Events
- `row-click`: Emitted when row is click if `clickable-rows` prop is set to true. The event payload contains the clicked row data.

## Compatibility

This component is designed to work with Laravel's [`yajra/laravel-datatables-oracle`](https://yajrabox.com/docs/laravel-datatables). It may work with other packages that use a similar input/output structure, but it has not been tested extensively with other packages.

Please make sure that your Laravel backend and the API endpoints are configured to work with this component.

## License

This DatatableCard component is open-source software licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.