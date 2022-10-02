class StickyWrapper extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = "<div><slot></slot></div>";

    this.heights = new Map();
    this.resizeListener = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.heights.set(
          entry.target.closest("sticky-header,th"),
          entry.contentRect.height
        );
      }
      console.log("resize", entries);
      console.log("heights", this.heights);

      let top = 0;
      let currentlyInThead = false;
      for (const header of this.querySelectorAll("sticky-header,sticky-table-header")) {
        if (header.tagName === 'STICKY-TABLE-HEADER') {
          currentlyInThead = true;
          const el = header.parentNode;
          el.style.top = `${top}px`;
          if (!currentlyInThead) {
            top += this.heights.get(el);
          }
        } else {
          currentlyInThead = false;
          console.log("set top offset for", header, "to", top);
          header.style.top = `${top}px`;
          top += this.heights.get(header);
        }
      }

      const rootDiv = this.shadowRoot.firstElementChild;
      rootDiv.style.position = 'absolute';
      rootDiv.style.top = '0';
      rootDiv.style.left = '0';
      rootDiv.style.width = '100%';
      rootDiv.style.height = "100%";
      rootDiv.style.overflow = "auto";
      rootDiv.style.scrollPaddingTop = `${top}px`;
    });

    this.addEventListener("sticky-header-connected", (ev) => {
      ev.stopPropagation();
      const inner = ev.target.firstElementChild;

      console.log("event handler: sticky header connected, add observe", ev);
      console.log("observing", inner);
      this.resizeListener.observe(inner);
    });

    this.addEventListener("sticky-table-header-connected", (ev) => {
      ev.stopPropagation();
      const inner = ev.target.parentNode;

      console.log("event handler: sticky table header connected, add observe", ev);
      console.log("observing", inner);
      this.resizeListener.observe(inner);
    });

    this.addEventListener("sticky-header-disconnected", (ev) => {
      ev.stopPropagation();

      const inner = ev.target.firstElementChild;

      console.log(
        "event handler: sticky header disconnected, add unobserve",
        ev
      );
      this.resizeListener.unobserve(inner);
      this.heights.delete(this);
    });

    this.addEventListener("sticky-table-header-disconnected", (ev) => {
      ev.stopPropagation();

      const inner = ev.target.parentNode;

      console.log(
        "event handler: sticky table header disconnected, add unobserve",
        ev
      );
      this.resizeListener.unobserve(inner);
      this.heights.delete(this);
    });
  }

  //  Invoked when the custom element is first connected to the document's DOM.
  connectedCallback() {
    console.log(
      "connected callback for wrapper, dispatch sticky-wrapper-connected"
    );
    this.dispatchEvent(
      new CustomEvent("sticky-wrapper-connected", { bubbles: true })
    );
  }
  // Invoked when the custom element is disconnected from the document's DOM.
  disconnectedCallback() {}
  // Invoked when the custom element is moved to a new document.
  adoptedCallback() {}
  // Invoked when one of the custom element's attributes is added, removed, or changed.
  attributeChangedCallback(key, value) {
    console.log("attr changed", key, value);
  }
}

class StickyHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = "<slot>";

    this.style = this.getAttribute("style");
    this.style.position = "sticky";
    this.style.top = "0";
    this.style.zIndex = 1;
  }

  //  Invoked when the custom element is first connected to the document's DOM.
  connectedCallback() {
    console.log("connected callback for header");
    this.dispatchEvent(
      new CustomEvent("sticky-header-connected", { bubbles: true })
    );
  }
  // Invoked when the custom element is disconnected from the document's DOM.
  disconnectedCallback() {
    this.dispatchEvent(
      new CustomEvent("sticky-header-disconnected", { bubbles: true })
    );
  }
  // Invoked when the custom element is moved to a new document.
  adoptedCallback() {}
  // Invoked when one of the custom element's attributes is added, removed, or changed.
  attributeChangedCallback(key, oldValue, newValue) {
    this.dispatchEvent(
      new CustomEvent("sticky-header-attribute-changed", { bubbles: true })
    );
    console.log("attr changed", key, oldValue, newValue);
  }
}

class StickyTableHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = "<slot>";

    this.style = this.getAttribute("style");
    this.style.position = "sticky";
    this.style.top = "0";
    this.style.zIndex = 1;
  }

  connectedCallback() {
    if (this.parentNode instanceof HTMLTableCellElement) {
      this.parentNode.style.position = 'sticky';
      this.parentNode.style.top = '0';
      this.dispatchEvent(
        new CustomEvent("sticky-table-header-connected", { bubbles: true })
      );
    }
  }
  disconnectedCallback() {
    this.dispatchEvent(
      new CustomEvent("sticky-table-header-disconnected", { bubbles: true })
    );
  }
}

customElements.define("sticky-wrapper", StickyWrapper);
customElements.define("sticky-header", StickyHeader);
customElements.define("sticky-table-header", StickyTableHeader);
