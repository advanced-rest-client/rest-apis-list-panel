[![Build Status](https://travis-ci.org/advanced-rest-client/rest-apis-list-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/rest-apis-list-panel)  

# rest-apis-list-panel

`<rest-apis-list-panel>` REST APIs project list screen

This element requires `arc-models/rest-api-model` element to be present in the
DOM as this element does not connect to the datastore directly.
The `arc-models/rest-api-model` element can be replaced by any element that
supports the same event's API.

### Example

```html
<link rel="import" href="../rest-apis-list-panel/rest-apis-list-panel.html">
<link rel="import" href="../arc-models/rest-api-model.html">

<rest-apis-list-panel></rest-apis-list-panel>
<rest-api-model></rest-api-model>
```

### Styling
`<rest-apis-list-panel>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--rest-apis-list-panel` | Mixin applied to the element | `{}`
`--rest-apis-list-panel-loader` | Mixin applied to the paper-progress element | `{}`
`--arc-font-headline` | Mixin applied to the header | `{}`
`--arc-font-subhead` | Mixin applied to the subheader | `{}`
`--warning-primary-color` | Main color of the warning messages | `#FF7043`
`--warning-contrast-color` | Contrast color for the warning color | `#fff`
`--error-toast` | Mixin applied to the error toast | `{}`
`--empty-info` | Mixin applied to the label rendered when no data is available. | `{}`



### Events
| Name | Description | Params |
| --- | --- | --- |
| navigate | Dispatched when the user opens the API portal. | base **String** - `api-console` or `exchange-search` |
id **?String** - API datastore ID if `base` is `api-console` |
| rest-api-deleted | Dispatched when the user request to delete API entry. | id **String** - Datastore id of the entry to be deleted |
| rest-api-index-list | Dispatched automatically when the element becomes visible to request API listing data from the datastore. | nextPageToken **?String** - Optional, page token returned with previous query |
# rest-apis-grid-item

`<rest-apis-grid-panel>` Displays a single grid item for REST APIs list screen.

### Example
```
<rest-apis-grid-item item="{...}"></rest-apis-grid-panel>
```

### Styling
`<rest-apis-grid-item>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--rest-apis-grid-item` | Mixin applied to the element | `{}`
`--rest-apis-grid-item-action-button` | Mixin applied to the visible accrion button | `{}`
`--rest-apis-grid-item-card-background-color` | Background color of the card item | `#fff`



### Events
| Name | Description | Params |
| --- | --- | --- |
| delete-list-item | Dispatched when the user click on "delete" button. The event does not bubble.  The detail object is the item passed to the element. | __none__ |
| open-list-item | Dispatched when the user click on "open" button. The event does not bubble.  The detail object is the item passed to the element. | __none__ |
# rest-apis-list-item

`<rest-apis-list-item>` Displays a single list item for REST APIs list screen.

### Example

```html
<rest-apis-list-item item="{...}"></rest-apis-list-panel>
```

### Styling
`<rest-apis-list-item>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--rest-apis-list-item` | Mixin applied to the element | `{}`
`--rest-apis-list-item-action-button` | Mixin applied to the visible accrion button | `{}`



### Events
| Name | Description | Params |
| --- | --- | --- |
| delete-list-item | Dispatched when the user click on "delete" button. The event does not bubble.  The detail object is the item passed to the element. | __none__ |
| open-list-item | Dispatched when the user click on "open" button. The event does not bubble.  The detail object is the item passed to the element. | __none__ |
