class ShareWeb {
  async share(options = {}) {
    if (navigator.share) return navigator.share(options);
    if (options.text && navigator.clipboard)
      return navigator.clipboard.writeText(options.text);
    return undefined;
  }

  async canShare() {
    return { value: !!navigator.share };
  }
}

export { ShareWeb };
