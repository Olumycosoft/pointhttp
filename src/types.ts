export interface PointHttpOptions {
  /**
   * The route path where the playground will be mounted.
   * @default '/docs/http'
   */
  path?: string;

  /**
   * The directory or list of directories to recursively scan for .http files.
   * Can be absolute paths or relative to process.cwd().
   * @default ['src']
   */
  modulesDir?: string | string[];

  /**
   * Browser page title.
   * @default 'PointHTTP Playground'
   */
  title?: string;

  /**
   * Logo short text/avatar to display in the sidebar.
   * @default 'PH'
   */
  logoText?: string;

  /**
   * Logo title text to display in the sidebar.
   * @default 'PointHTTP'
   */
  logoTitle?: string;

  /**
   * Map of default environment variables pre-populated in the UI.
   */
  envVariables?: Record<string, string>;

  /**
   * Custom CSS styling to inject into the rendered HTML page to override styles.
   */
  customCss?: string;

  /**
   * Custom decorators to apply to the controller route handler (e.g. IsPublic, UseGuards).
   */
  decorators?: Array<ClassDecorator | MethodDecorator | PropertyDecorator>;

  /**
   * Explicitly enable or disable the playground documentation.
   * If omitted, relies on enabledEnvironments.
   */
  enabled?: boolean;

  /**
   * List of allowed environments where the playground is accessible.
   * Compares against process.env.NODE_ENV.
   * @default ['development', 'dev', 'test']
   */
  enabledEnvironments?: string[];

  /**
   * Custom authentication check to gate access to the playground.
   * Accepts Express request and response. If returns false or throws, returns 403 Forbidden.
   */
  customAuth?: (req: any, res: any) => boolean | Promise<boolean>;
}
