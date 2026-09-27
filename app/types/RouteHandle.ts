export type RouteHandle = {
  type?: 'frameData';
  /** Set on character sub routes that render their own heading instead of the
      shared character header with the section nav. */
  hideCharacterHeader?: boolean;
};
