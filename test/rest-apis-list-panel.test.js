import { fixture, assert, html, aTimeout, nextFrame } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../rest-apis-list-panel.js';

describe('<rest-apis-list-panel>', function() {
  async function basicFixture() {
    return await fixture(html`<rest-apis-list-panel></rest-apis-list-panel>`);
  }

  async function exploreFixture() {
    return await fixture(html`<rest-apis-list-panel renderExplore></rest-apis-list-panel>`);
  }

  async function dataFixture(apis) {
    return await fixture(html`<rest-apis-list-panel
      .items="${apis}"></rest-apis-list-panel>`);
  }

  before(async () => {
    await DataGenerator.destroyAllApiData();
  });

  describe('empty list', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('hasItems is false', () => {
      assert.isFalse(element.hasItems);
    });

    it('dataUnavailable is true', () => {
      assert.isTrue(element.dataUnavailable);
    });

    it('renders empty message', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.ok(node);
    });
  });

  describe('list with items', () => {
    let element;
    beforeEach(async () => {
      const items = DataGenerator.generateApiIndexList();
      element = await dataFixture(items);
    });

    it('hasItems is true', () => {
      assert.isTrue(element.hasItems);
    });

    it('dataUnavailable is false', () => {
      assert.isFalse(element.dataUnavailable);
    });

    it('does not render empty message', () => {
      const node = element.shadowRoot.querySelector('.empty-info');
      assert.notOk(node);
    });

    it('renders list items', () => {
      const nodes = element.shadowRoot.querySelectorAll('.list > anypoint-item');
      assert.lengthOf(nodes, 25);
    });

    it('dispatches navigation event when button clicked', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      const node = element.shadowRoot.querySelector('anypoint-item anypoint-button');
      MockInteractions.tap(node);
      assert.isTrue(spy.called);
      const detail = spy.args[0][0].detail;
      assert.equal(detail.base, 'api-console');
      assert.equal(detail.id, element.items[0]._id);
      assert.equal(detail.version, element.items[0].latest);
    });
  });

  describe('reset()', () => {
    let element;
    beforeEach(async () => {
      const items = DataGenerator.generateApiIndexList();
      element = await dataFixture(items);
    });

    it('Clears nextPageToken', () => {
      element.nextPageToken = 'test';
      element.reset();
      assert.isUndefined(element.nextPageToken);
    });

    it('Clears __queryTimeout', () => {
      element.__queryTimeout = 123;
      element.reset();
      assert.isUndefined(element.__queryTimeout);
    });

    it('Clears querying', () => {
      element.querying = true;
      element.reset();
      assert.isFalse(element.querying);
    });

    it('Clears items', () => {
      element.reset();
      assert.deepEqual(element.items, []);
    });
  });

  describe('_getApiListOptions()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns empty object by default', () => {
      const result = element._getApiListOptions();
      assert.deepEqual(result, {});
    });

    it('Adds nextPageToken', () => {
      element.nextPageToken = 'abc';
      const result = element._getApiListOptions();
      assert.deepEqual(result, {
        nextPageToken: 'abc'
      });
    });
  });

  describe('loadPage()', () => {
    before(async () => {
      await DataGenerator.insertApiData();
    });

    after(async () => {
      await DataGenerator.destroyAllApiData();
    });

    let element;
    beforeEach(async () => {
      // prevents auto query
      element = await dataFixture([]);
    });

    it('Sets result', async () => {
      await element.loadPage();
      assert.lengthOf(element.items, 25);
    });

    it('Sets nextPageToken', async () => {
      await element.loadPage()
      assert.typeOf(element.nextPageToken, 'string');
    });
  });

  describe('_sortData()', () => {
    let element;
    beforeEach(async () => {
      // prevents auto query
      element = await dataFixture([]);
    });

    it('Returns -1 when a order is < than b order', () => {
      const result = element._sortData({
        order: 0
      }, {
        order: 1
      });
      assert.equal(result, -1);
    });

    it('Returns 1 when a order is > than b order', () => {
      const result = element._sortData({
        order: 1
      }, {
        order: 0
      });
      assert.equal(result, 1);
    });

    it('Compares names otherwise', () => {
      const result = element._sortData({
        order: 0,
        name: 'a'
      }, {
        order: 0,
        name: 'b'
      });
      assert.equal(result, -1);
    });

    it('Compares names when missing', () => {
      const result = element._sortData({
        order: 0
      }, {
        order: 0,
        name: 'b'
      });
      assert.equal(result, -1);
    });
  });

  describe('Events tests', function() {
    function genIndexItem(id) {
      id = id || 'test-id';
      return {
        _id: id,
        title: 'test-title',
        order: 0,
        latest: 'a',
        versions: ['a']
      };
    }

    function fire(type, detail, cancelable) {
      if (typeof cancelable !== 'boolean') {
        cancelable = false;
      }
      const e = new CustomEvent(type, {
        detail,
        cancelable,
        bubbles: true
      });
      document.body.dispatchEvent(e);
      return e;
    }

    function fireUpdated(id, cancelable) {
      return fire('api-index-changed', {
        apiInfo: genIndexItem(id)
      }, cancelable);
    }

    function fireDeleted(id, cancelable) {
      return fire('api-deleted', {
        id: id || 'test-id'
      }, cancelable);
    }

    function fireDbDeleted(name) {
      const detail = {};
      if (name) {
        detail.datastore = name;
      }
      return fire('datastore-destroyed', detail);
    }

    function fireImported() {
      const detail = {};
      return fire('data-imported', detail);
    }

    describe('Update event', function() {
      let element;
      beforeEach(async () => {
        // prevents auto query
        element = await dataFixture([]);
      });

      it('Ignores cancelable events', () => {
        fireUpdated(undefined, true);
        assert.deepEqual(element.items, []);
      });

      it('Adds an item to undefined list', () => {
        fireUpdated();
        assert.typeOf(element.items, 'array');
        assert.lengthOf(element.items, 1);
      });

      it('Computes `hasItems` after adding', () => {
        fireUpdated();
        assert.isTrue(element.hasItems);
      });

      it('Updates an existing item', () => {
        const item = genIndexItem();
        item.title = 'test-updated';
        element.items = [item];
        fireUpdated();
        assert.lengthOf(element.items, 1);
        const current = element.items[0];
        assert.equal(current.title, 'test-title');
      });

      it('Updates an existing item when in search', () => {
        const item = genIndexItem();
        item.title = 'test-updated';
        element.items = [item];
        element.queryItems(item._id);
        fireUpdated();
        assert.lengthOf(element.items, 1);
        const current = element.items[0];
        assert.equal(current.title, 'test-title');
      });

      it('Adds new item to existing list', () => {
        const item = genIndexItem();
        item._id = 'test-id2';
        element.items = [item];
        fireUpdated();
        assert.lengthOf(element.items, 2);
      });
    });

    describe('Delete event', function() {
      let element;
      beforeEach(async () => {
        // prevents auto query
        element = await dataFixture([]);
      });

      it('Ignores cancelable events', () => {
        fireDeleted(undefined, true);
        assert.deepEqual(element.items, []);
      });

      it('Do nothing if item is not on the list', () => {
        const item = genIndexItem();
        item._id = 'other-id';
        element.items = [item];
        fireDeleted();
        assert.lengthOf(element.items, 1);
      });

      it('Removes item from the list', () => {
        element.items = [genIndexItem()];
        fireDeleted();
        assert.lengthOf(element.items, 0);
      });

      it('Computes `hasItems` after removal', () => {
        element.items = [genIndexItem()];
        fireDeleted();
        assert.isFalse(element.hasItems);
      });
    });

    describe('Delete datastore event', function() {
      let element;
      beforeEach(async () => {
        element = await dataFixture([genIndexItem()]);
      });

      it('Ignores events without `datastore` property', () => {
        fireDbDeleted();
        assert.lengthOf(element.items, 1);
      });

      it('Ignores other deleted data stores', () => {
        fireDbDeleted('test');
        assert.lengthOf(element.items, 1);
      });

      it('Clears items for "api-index"', () => {
        fireDbDeleted('api-index');
        assert.lengthOf(element.items, 0);
      });

      it('Clears items for "all"', () => {
        fireDbDeleted('all');
        assert.lengthOf(element.items, 0);
      });

      it('Clears items for "api-index" as an array', () => {
        fireDbDeleted(['api-index']);
        assert.lengthOf(element.items, 0);
      });
    });

    describe('Data import', function() {
      let element;
      beforeEach(async () => {
        // prevents auto query
        element = await dataFixture([]);
      });

      it('calls reset()', () => {
        const spy = sinon.spy(element, 'reset');
        fireImported();
        assert.isTrue(spy.called);
      });

      it('calls refresh()', () => {
        const spy = sinon.spy(element, 'refresh');
        fireImported();
        assert.isTrue(spy.called);
      });
    });
  });

  describe('queryItems()', () => {
    let element;
    beforeEach(async () => {
      const items = DataGenerator.generateApiIndexList({
        size: 5
      });
      element = await dataFixture(items);
    });

    it('Calls _resetSearch() when no argument', () => {
      const spy = sinon.spy(element, '_resetSearch');
      element.queryItems();
      assert.isTrue(spy.called);
    });

    it('Sets isSearch', () => {
      element.queryItems('test');
      assert.isTrue(element.isSearch);
    });

    it('Sets _beforeQueryItems', () => {
      element.queryItems('test');
      assert.typeOf(element._beforeQueryItems, 'array');
      assert.lengthOf(element._beforeQueryItems, 5);
    });

    it('Won\'t re-set _beforeQueryItems', () => {
      element._beforeQueryItems = [{}];
      element.queryItems('test');
      assert.typeOf(element._beforeQueryItems, 'array');
      assert.lengthOf(element._beforeQueryItems, 1);
    });

    it('Sets item undefined when empty array', () => {
      element.items = [];
      element.queryItems('test');
      assert.isUndefined(element.items);
    });

    it('Calls _prepareQuery()', () => {
      const spy = sinon.spy(element, '_prepareQuery');
      element.queryItems('test');
      assert.isTrue(spy.called);
    });

    it('Sets new items', () => {
      element.queryItems('test');
      assert.lengthOf(element.items, 0);
    });

    it('Filters by ID', () => {
      element.queryItems(element.items[0]._id);
      assert.lengthOf(element.items, 1);
    });

    it('Filters by title', () => {
      element.items[0].title = 'test of querying';
      element.queryItems('test');
      assert.lengthOf(element.items, 1);
    });

    it('Filters by description', () => {
      element.items[0].description = 'test of querying';
      element.queryItems('test');
      assert.lengthOf(element.items, 1);
    });
  });

  describe('_prepareQuery()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Transforms input to string', () => {
      const result = element._prepareQuery(123);
      assert.equal(result, '123');
    });

    it('Lower case the query', () => {
      const result = element._prepareQuery('TEST');
      assert.equal(result, 'test');
    });

    it('Removes "_" character', () => {
      const result = element._prepareQuery('_TEST');
      assert.equal(result, 'test');
    });
  });

  describe('Deletes an item', () => {
    let items;
    let element;
    beforeEach(async () => {
      const [index] = await DataGenerator.insertApiData({
        size: 1
      });
      items = index;
      element = await dataFixture(items);
    });

    after(async () => {
      await DataGenerator.destroyAllApiData();
    });

    it('calls remove() on the model', async () => {
      const button = element.shadowRoot.querySelector('.delete-item');
      const model = element.apiModel;
      const spy = sinon.spy(model, 'remove');
      MockInteractions.tap(button);
      assert.isTrue(spy.called, 'Function is called');
      assert.equal(spy.args[0][0], items[0]._id, 'Argument is set');
      await aTimeout();
    });

    it('Eventually removes the item from the list', async () => {
      await element._deleteItem(items[0]._id);
      assert.lengthOf(element.items, 0);
    });

    it('deletes item when in search', async () => {
      element.queryItems(items[0]._id);
      await nextFrame();
      assert.lengthOf(element.items, 1);
      await element._deleteItem(items[0]._id);
      assert.lengthOf(element.items, 0);
    });
  });

  describe('Explore button', () => {
    let element;
    beforeEach(async () => {
      element = await exploreFixture();
    });

    it('renders explore button', () => {
      const button = element.shadowRoot.querySelector('.explore-button');
      assert.ok(button);
    });

    it('dispatches navigation event', () => {
      const spy = sinon.spy();
      element.addEventListener('navigate', spy);
      const button = element.shadowRoot.querySelector('.explore-button');
      MockInteractions.tap(button);
      assert.isTrue(spy.called, 'event called');
      assert.equal(spy.args[0][0].detail.base, 'exchange-search', 'base is set');
    });
  });

  describe('_searchHandler()', () => {
    let element;
    beforeEach(async () => {
      const items = DataGenerator.generateApiIndexList({
        size: 5
      });
      element = await dataFixture(items);
    });

    it('calls updateSearch() when search event is dispatched on input', () => {
      const spy = sinon.spy(element, 'updateSearch');
      const input = element.shadowRoot.querySelector('[type="search"]');
      input.dispatchEvent(new CustomEvent('search'));
      assert.isTrue(spy.called);
    });
  });

  describe('_queryHandler()', () => {
    let element;
    beforeEach(async () => {
      const items = DataGenerator.generateApiIndexList({
        size: 5
      });
      element = await dataFixture(items);
    });

    it('sets query when search input value change', () => {
      const input = element.shadowRoot.querySelector('[type="search"]');
      input.value = 'test';
      assert.equal(element.query, 'test');
    });
  });
});
