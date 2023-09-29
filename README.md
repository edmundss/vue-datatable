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
    <DatatableCard
      :cardTitle="cardTitle"
      :columns="columns"
      :url="dataUrl"
      :selectableRows="true"
      :order="defaultOrder"
      :advancedSearch="true"
      :loadDataOnInit="true"
      @row-click="handleRowClick"
    >
    </DatatableCard>
  </div>
</template>

<script>
import DatatableCard from '@sulzanoks/vue-datatable';

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
      defaultOrder: [{ column: 0, dir: 'asc' }],
    };
  },
  methods: {
    handleRowClick(row) {
      // Handle row click event here
    },
  },
};
</script>
```

## Props

The DatatableCard component accepts the following props:

- `cardTitle` (String): The title for the datatable card.
- `columns` (Array): An array of column objects defining the datatable columns.
  - `data` (String): The key to access the data for this column in the API response.
  - `displayName` (String): The display name or label for this column.
  - `name` (String): The unique name or identifier for this column.
  - `searchable` (Boolean, optional, default: true): Set to `false` to disable searching for this column.
  - `sortable` (Boolean, optional, default: true): Set to `false` to disable sorting for this column.
  - `linkParams` (Object, optional): Defines link parameters for generating Vue.js style links.
    - `name` (String): The name of the Vue.js route to navigate to when clicking the link.
    - `resourceIds` (Array): An array of resource IDs to use in generating the link. Replace with actual resource IDs.
- `url` (String): The URL for fetching datatable data.
- `selectableRows` (Boolean): Set to `true` to enable row selection. For now only works if you have a, `id` column in your data set. 
- `order` (Array): The initial column sorting order.
- `advancedSearch` (Boolean): Set to `true` to enable advanced search.
- `loadDataOnInit` (Boolean): Set to `true` to load data when the component is initialized.

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
- `getSelectedRows`: Returns array of selected rows
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

## Compatibility

This component is designed to work with Laravel's `yajra/laravel-datatables-oracle`. It may work with other packages that use a similar input/output structure, but it has not been tested extensively with other packages.

Please make sure that your Laravel backend and the API endpoints are configured to work with this component.

## License

This DatatableCard component is open-source software licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.