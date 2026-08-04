class FilesystemWeb {
  async writeFile(options = {}) {
    const data = options.data || "";
    return { uri: `data:text/plain;base64,${data}` };
  }

  async getUri(options = {}) {
    return { uri: options.path || "" };
  }
}

const Directory = {
  Cache: "CACHE",
  Documents: "DOCUMENTS",
  Data: "DATA",
};

export { Directory, FilesystemWeb };
