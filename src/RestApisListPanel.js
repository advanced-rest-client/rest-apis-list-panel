/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html, css } from 'lit-element';
import '@anypoint-web-components/anypoint-item/anypoint-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-menu-button/anypoint-menu-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@polymer/paper-progress/paper-progress.js';
import '@advanced-rest-client/arc-models/rest-api-model.js';
import { moreVert } from '@advanced-rest-client/arc-icons/ArcIcons.js';
/**
 * REST APIs project list screen
 *
 * This element requires `arc-models/rest-api-model` element to be present in the
 * DOM as this element does not connect to the datastore directly.
 * The `arc-models/rest-api-model` element can be replaced by any element that
 * supports the same event's API.
 *
 * ### Example
 *
 * ```html
 * <rest-apis-list-panel></rest-apis-list-panel>
 * <rest-api-model></rest-api-model>
 * ```
 *
 * ### Styling
 *
 * `<rest-apis-list-panel>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--warning-primary-color` | Main color of the warning messages | `#FF7043`
 * `--warning-contrast-color` | Contrast color for the warning color | `#fff`
 *
 * @customElement
 * @memberof UiElements
 * @demo demo/index.html
 */
export class RestApisListPanel extends LitElement {
  static get styles() {
    return css`
    :host {
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    h2 {
      font-size: var(--arc-font-headline-font-size);
      font-weight: var(--arc-font-headline-font-weight);
      letter-spacing: var(--arc-font-headline-letter-spacing);
      line-height: var(--arc-font-headline-line-height);
      flex: 1;
      flex-basis: 0.000000001px;
    }

    paper-progress {
      width: 100%;
    }

    .error-toast {
      background-color: var(--warning-primary-color, #FF7043);
      color: var(--warning-contrast-color, #fff);
    }

    .empty-info {
      font-size: var(--arc-font-body1-font-size);
      font-weight: var(--arc-font-body1-font-weight);
      line-height: var(--arc-font-body1-line-height);
      font-style: italic;
      margin: 1em 16px;
      color: var(--arc-menu-empty-info-color);
    }

    .header-actions {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .header-actions anypoint-input {
      flex: 2;
      margin-left: 16px;
    }

    .list {
      flex: 1;
      overflow: auto;
    }

    .explore-button {
      margin-right: 12px;
    }

    .api-title {
      font-size: 16px;
      font-weight: 500;
      padding: 0;
      margin: 0;
    }

    .meta {
      margin: 0;
      padding: 0;
      margin-right: 12px;
    }

    .icon {
      fill: currentColor;
      display: inline-block;
      width: 24px;
      height: 24px;
    }
    `;
  }

  static get properties() {
    return {
      /**
       * Saved items restored from the datastore.
       */
      items: { type: Array },
      /**
       * True when the element is querying the database for the data.
       */
      querying: { type: Boolean },
      /**
       * Page token for datastore pagination.
       */
      nextPageToken: { type: String },
      /**
       * Search query for the list.
       */
      query: { type: String },
      /**
       * If set it renders the "Explore APIs" button
       */
      renderExplore: { type: Boolean },
      /**
       * When set the element won't query for APIs data when connected to the DOM.
       * In this case manually call `makeQuery()`
       */
      noAutoQuery: { type: Boolean },

      isSearch: { type: Boolean },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables outlined input theme
       */
      outlined: { type: Boolean },
    };
  }

  /**
   * Computed value. `true` if the `items` property has values.
   * @return {Boolean}
   */
  get hasItems() {
    const { items } = this;
    return !!(items && items.length);
  }
  /**
   * Computed value. True if query ended and there's no results.
   * @return {Boolean}
   */
  get dataUnavailable() {
    const { hasItems, querying } = this;
    return !hasItems && !querying;
  }
  /**
   * @return {Boolean} True when the list is hidden.
   */
  get listHidden() {
    const { hasItems, isSearch } = this;
    if (isSearch) {
      return false;
    }
    return !hasItems;
  }

  get modelTemplate() {
    return html`
      <rest-api-model></rest-api-model>
    `;
  }

  get apiModel() {
    if (!this.__apiModel) {
      this.__apiModel = this.shadowRoot.querySelector('rest-api-model');
    }
    return this.__apiModel;
  }

  constructor() {
    super();
    this._dataImportHandler = this._dataImportHandler.bind(this);
    this._onDatabaseDestroy = this._onDatabaseDestroy.bind(this);
    this._indexUpdated = this._indexUpdated.bind(this);
    this._indexDeleted = this._indexDeleted.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('data-imported', this._dataImportHandler);
    window.addEventListener('datastore-destroyed', this._onDatabaseDestroy);
    window.addEventListener('api-index-changed', this._indexUpdated);
    window.addEventListener('api-deleted', this._indexDeleted);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    if (this.__queryTimeout) {
      clearTimeout(this.__queryTimeout);
      this.__queryTimeout = undefined;
    }
    window.removeEventListener('data-imported', this._dataImportHandler);
    window.removeEventListener('datastore-destroyed', this._onDatabaseDestroy);
    window.removeEventListener('api-index-changed', this._indexUpdated);
    window.removeEventListener('api-deleted', this._indexDeleted);
  }

  firstUpdated() {
    if (!this.querying && !this.items) {
      this.makeQuery();
    }
  }
  /**
   * Handler for `data-imported` cutom event.
   * Refreshes data state.
   */
  _dataImportHandler() {
    this.reset();
    this.refresh();
  }
  /**
   * Resets the state of the variables.
   */
  reset() {
    if (this.nextPageToken) {
      this.nextPageToken = undefined;
    }
    if (this.__queryTimeout) {
      clearTimeout(this.__queryTimeout);
      this.__queryTimeout = undefined;
    }
    this.querying = (false);
    this.items = [];
  }
  /**
   * Resets the state after finishing search. It restors previous items
   * without changing query options.
   */
  _resetSearch() {
    this.items = this._beforeQueryItems;
    this.isSearch = false;
    this._beforeQueryItems = undefined;
    if (!this.items) {
      this.refresh();
    }
  }
  /**
   * Refreshes the data from the datastore.
   * It resets the query options, clears items and makes a query to the datastore.
   */
  refresh() {
    this.reset();
    this.makeQuery();
  }

  // Handler for the `datastore-destroyed` custom event
  _onDatabaseDestroy(e) {
    let { datastore } = e.detail;
    if (!datastore || !datastore.length) {
      return;
    }
    if (typeof datastore === 'string') {
      datastore = [datastore];
    }
    if (datastore.indexOf('api-index') === -1 && datastore[0] !== 'all') {
      return;
    }
    this.refresh();
  }
  /**
   * The function to call when new query for data is needed.
   * Use this intead of `loadPage()` as this function uses debouncer to
   * prevent multiple calls at once.
   */
  makeQuery() {
    if (this.__makingQuery) {
      return;
    }
    this.__makingQuery = true;
    this.__queryTimeout = setTimeout(() => {
      this.__queryTimeout = undefined;
      this.__makingQuery = false;
      this.loadPage();
    }, 20);
  }

  _getApiListOptions() {
    const detail = {};
    if (this.nextPageToken) {
      detail.nextPageToken = this.nextPageToken;
    }
    return detail;
  }
  /**
   * Performs the query and processes the result.
   * This function immediately queries the data model for data.
   * It does this in a loop until all data are read.
   *
   * @return {Promise}
   */
  async loadPage() {
    const options = this._getApiListOptions();
    const model = this.apiModel;
    this.querying = true;
    try {
      const result = await model.listIndex(options);
      this.nextPageToken = result.nextPageToken;
      const items = result.items;
      if (!items || !items.length) {
        this.querying = false;
        return;
      }
      if (!this.items) {
        items.sort(this._sortData);
        this.items = items;
      } else {
        const concat = this.items.concat(items);
        concat.sort(this._sortData);
        this.items = concat;
      }
      await this.makeQuery();
    } catch(e) {
      // ...
    }
    this.querying = false;
  }
  /**
   * Sorts projects list by `order` and the `title` properties.
   *
   * @param {Object} a
   * @param {Object} b
   * @return {Number}
   */
  _sortData(a, b) {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return (a.title || '').localeCompare(b.title);
  }
  // Handler for the `click` event on the list item.
  _openAPI(e) {
    const index = Number(e.currentTarget.dataset.index);
    const item = this.items[index];
    const id = item._id;
    const version = item.latest;
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: {
        base: 'api-console',
        id,
        version
      }
    }));
  }
  /**
   * Handler for the `api-index-changed` custom event.
   * Only handles the change if the event is non-cancelable.
   *
   * @param {CustomEvent} e
   */
  _indexUpdated(e) {
    if (e.cancelable) {
      return;
    }
    const item = e.detail.apiInfo;
    if (this.isSearch) {
      this._indexUpdatedSearch(item);
      return;
    }
    const items = this.items;
    if (!items) {
      this.items = [item];
      return;
    }
    const index = this.items.findIndex((obj) => obj._id === item._id);
    if (index === -1) {
      items.push(item);
      items.sort(this._sortData);
    } else {
      items[index] = item;
    }
    this.items = [...items];
  }
  /**
   * Updates a list item when the search is on.
   * @param {Object} item An item to update.
   */
  _indexUpdatedSearch(item) {
    if (!this._beforeQueryItems) {
      return;
    }
    // checks current visible items.
    let items = this.items;
    if (items && items.length) {
      const index = items.findIndex((obj) => obj._id === item._id);
      if (index > -1) {
        items[index] = item;
        this.items = [...items];
      }
    }
    // checks in-memory full list of items
    items = this._beforeQueryItems;
    if (!items) {
      this._beforeQueryItems = [item];
    } else {
      const index = items.findIndex((obj) => obj._id === item._id);
      if (index === -1) {
        items.push(item);
      } else {
        items[index] = item;
      }
      this._beforeQueryItems = items;
    }
  }
  /**
   * Handler for the `api-deleted` custom event.
   * @param {CustomEvent} e
   */
  _indexDeleted(e) {
    if (e.cancelable) {
      return;
    }
    const { id } = e.detail;
    if (this.isSearch) {
      this._indexDeletedSearch(id);
      return;
    }
    const { items } = this;
    if (!items || !items.length) {
      return;
    }
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) {
      return;
    }
    items.splice(index, 1);
    this.items = [...items];
  }
  /**
   * Handles delete event when search is on.
   * Updates bothe `items` and `_beforeQueryItems` lists if removed item is on
   * any of those lists.
   * @param {String} id The ID of deleted item.
   */
  _indexDeletedSearch(id) {
    if (!this._beforeQueryItems) {
      return;
    }
    // checks current visible items.
    let items = this.items;
    if (items && items.length) {
      const index = items.findIndex((obj) => obj._id === id);
      if (index > -1) {
        items.splice(index, 1);
        this.items = [...items];
      }
    }
    // checks in-memory full list of items
    items = this._beforeQueryItems;
    if (items) {
      const index = items.findIndex((obj) => obj._id === id);
      if (index > -1) {
        items.splice(index, 1);
        this._beforeQueryItems = items;
      }
    }
  }

  updateSearch() {
    this.queryItems(this.query);
  }
  /**
   * Performs the search
   * @param {String} query An item to search for
   */
  queryItems(query) {
    if (!query) {
      this._resetSearch();
      return;
    }
    this.isSearch = true;
    if (!this._beforeQueryItems) {
      this._beforeQueryItems = this.items;
    }
    const availableItems = this.items;
    if (!availableItems || !availableItems.length) {
      this.items = undefined;
      return;
    }
    query = this._prepareQuery(query);
    const matches = availableItems.filter((item) => {
      if (item._id.toLowerCase().indexOf(query) !== -1) {
        return true;
      }
      if (typeof item.title === 'string' && item.title.toLowerCase().indexOf(query) !== -1) {
        return true;
      }
      if (typeof item.description === 'string' && item.description.indexOf(query) !== -1) {
        return true;
      }
      return false;
    });
    this.items = matches;
  }
  /**
   * Prepares the user query to be used in the datasore simple search.
   * @param {String} query User query
   * @return {String} Transformed query
   */
  _prepareQuery(query) {
    query = String(query);
    query = query.toLowerCase();
    if (query[0] === '_') {
      query = query.substr(1);
    }
    return query;
  }

  async _deleteHandler(e) {
    const index = Number(e.currentTarget.dataset.index);
    const item = this.items[index];
    await this._deleteItem(item._id);
  }
  /**
   * Dispatches cancelable `api-deleted` event for the model to delete
   * the entry.
   *
   * This requires `arc-models/rest-api-model` element to be present in the
   * DOM.
   * @param {String} id
   * @return {Promise}
   */
  async _deleteItem(id) {
    const model = this.apiModel;
    await model.remove(id);
  }
  /**
   * Dispatches `navigate` event to open Exchange explorer.
   */
  _openExplore() {
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: {
        base: 'exchange-search'
      }
    }));
  }

  _queryHandler(e) {
    this.query = e.detail.value;
  }

  _searchHandler() {
    this.updateSearch();
  }

  render() {
    return html`
    ${this.modelTemplate}
    ${this._headerTemplate()}
    ${this._busyTemplate()}
    ${this._unavailableTemplate()}
    ${this._listTemplate()}
    `;
  }

  _headerTemplate() {
    const {
      renderExplore,
      compatibility,
      outlined,
      query
    } = this;
    return html`
    <div class="header">
      <h2>REST APIs</h2>
      <div class="header-actions">
      ${renderExplore ?
        html`<anypoint-button
          emphasis="high"
          @click="${this._openExplore}"
          class="explore-button"
          data-action="explore-apis"
          ?compatibility="${compatibility}"
        >Explore APIs</anypoint-button>`
        : ''}
        <anypoint-input
          type="search"
          .value="${query}"
          @value-changed="${this._queryHandler}"
          nolabelfloat
          @search="${this._searchHandler}"
          ?compatibility="${compatibility}"
          ?outlined="${outlined}"
        >
          <label slot="label">Search</label>
        </anypoint-input>
      </div>
    </div>`;
  }

  _busyTemplate() {
    if (!this.querying) {
      return '';
    }
    return html`<paper-progress indeterminate></paper-progress>`;
  }

  _unavailableTemplate() {
    if (!this.dataUnavailable) {
      return '';
    }
    return html`<p class="empty-info">
      REST APIs list is empty. Drag and drop RAML zip file here to begin.
    </p>`;
  }

  _listTemplate() {
    if (this.listHidden) {
      return '';
    }
    const items = this.items || [];
    const list = items.map((item, index) => this._itemTemplate(item, index));
    return html`<section class="list">
    ${list}
    </section>`;
  }

  _itemTemplate(item, index) {
    const { compatibility } = this;
    return html`<anypoint-item>
      <anypoint-item-body twoline>
        <div class="api-title">${item.title}</div>
        <div secondary class="details">
          <p class="meta">Version: ${item.latest}</p>
        </div>
      </anypoint-item-body>
      <anypoint-button
        data-index="${index}"
        @click="${this._openAPI}"
        class="open-button"
        ?compatibility="${compatibility}"
      >Open</anypoint-button>
      <anypoint-menu-button
        closeonactivate
        ?compatibility="${compatibility}"
      >
        <anypoint-icon-button
          slot="dropdown-trigger"
          ?compatibility="${compatibility}"
        >
          <span class="icon">${moreVert}</span>
        </anypoint-icon-button>
        <anypoint-listbox
          slot="dropdown-content"
          ?compatibility="${compatibility}"
        >
          <anypoint-item
            data-index="${index}"
            @click="${this._deleteHandler}"
            class="delete-item"
          >Delete</anypoint-item>
        </anypoint-listbox>
      </anypoint-menu-button>
    </anypoint-item>`;
  }
  /**
   * Dispatched when the user opens the API portal.
   *
   * @event navigate
   * @param {String} base `api-console` or `exchange-search`
   * @param {?String} id API datastore ID if `base` is `api-console`
   */

  /**
   * Dispatched automatically when the element becomes visible to request
   * API listing data from the datastore.
   *
   * @event api-index-list
   * @param {?String} nextPageToken Optional, page token returned with previous
   * query
   */

  /**
   * Dispatched when the user request to delete API entry.
   *
   * @event rest-api-deleted
   * @param {String} id Datastore id of the entry to be deleted
   */
}
