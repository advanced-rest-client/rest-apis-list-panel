[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/rest-apis-list-panel.svg)](https://www.npmjs.com/package/@advanced-rest-client/rest-apis-list-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/rest-apis-list-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/rest-apis-list-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/rest-apis-list-panel)

# rest-apis-list-panel

REST APIs project list screen

## Usage

### Installation
```
npm install --save @advanced-rest-client/rest-apis-list-panel
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/rest-apis-list-panel/rest-apis-list-panel.js';

class SampleElement extends LitElement {
  get styles() {
    return css`
      rest-apis-list-panel {
        height: 500px;
      }
    `;
  }

  render() {
    return html`
    <rest-apis-list-panel></rest-apis-list-panel>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### List sizing

It is important to set implicit height of the element. It can be static value like `500px`, relative value like `100%` as long as a parent is sized for height, or a flex value, as long as parent is sized for height.
The list of requests is set to load only portion of the requests from the data store and load more when list scroll is near end. If there's no scroll then the element will load whole data store at initialization time.

## Development

```sh
git clone https://github.com/advanced-rest-client/rest-apis-list-panel
cd rest-apis-list-panel
npm install
```

### Running the tests

```sh
npm test
```

### Running the demo

```sh
npm start
```

## API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)
