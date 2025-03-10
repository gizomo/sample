class Platform {
  public isTizen(): boolean {
    return Boolean(window.tizen);
  }

  public isWebOS(): boolean {
    return Boolean(window.webOS);
  }
}

export default new Platform();
