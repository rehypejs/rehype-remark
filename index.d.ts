export = attacher;
/**
 * @typedef {import('unified').Settings} Settings
 * @typedef {import('unified').Transformer} Transformer
 */
/**
 * @param {Settings} destination
 * @param {Settings} options
 * @returns {Transformer}
 */
declare function attacher(destination: Settings, options: Settings): Transformer;
declare namespace attacher {
  export { Settings, Transformer };
}
type Settings = import('unified').Settings;
type Transformer = import('unified').Transformer;
