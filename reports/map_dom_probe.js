(() => {
  window.__mapDomProbe = [];
  const original = Node.prototype.removeChild;
  Node.prototype.removeChild = function(child) {
    const record = { parent: this.nodeName, parentId: this.id || '', childType: typeof child, childNode: child?.nodeName || '', childText: String(child?.textContent || '').slice(0,80), stack: new Error().stack };
    if (!(child instanceof Node) || /root|BIBLE|Map|leaflet/i.test(`${this.id} ${this.className} ${child?.className || ''} ${child?.textContent || ''}`)) window.__mapDomProbe.push(record);
    return original.call(this, child);
  };
  return 'probe-installed';
})();
