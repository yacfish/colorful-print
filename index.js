// colorful-print v1.0.1 by yacfish

export const ANSIStyles = {
  reset: "\x1b[0m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bright_black: "\x1b[90m",
  bright_red: "\x1b[91m",
  bright_green: "\x1b[92m",
  bright_yellow: "\x1b[93m",
  bright_blue: "\x1b[94m",
  bright_magenta: "\x1b[95m",
  bright_cyan: "\x1b[96m",
  bright_white: "\x1b[97m",
  bg_black: "\x1b[40m",
  bg_red: "\x1b[41m",
  bg_green: "\x1b[42m",
  bg_yellow: "\x1b[43m",
  bg_blue: "\x1b[44m",
  bg_magenta: "\x1b[45m",
  bg_cyan: "\x1b[46m",
  bg_white: "\x1b[47m",
  bg_bright_black: "\x1b[100m",
  bg_bright_red: "\x1b[101m",
  bg_bright_green: "\x1b[102m",
  bg_bright_yellow: "\x1b[103m",
  bg_bright_blue: "\x1b[104m",
  bg_bright_magenta: "\x1b[105m",
  bg_bright_cyan: "\x1b[106m",
  bg_bright_white: "\x1b[107m",
  bold: "\x1b[1m",
  underline: "\x1b[4m",
  italic: "\x1b[3m",
  inverse: "\x1b[7m",
  dim: "\x1b[2m",
  blink: "\x1b[5m",
  blink_fast: "\x1b[6m",
  hidden: "\x1b[8m",
  strikethrough: "\x1b[9m"
};


class Printer {
  _options = {};
  _instanceStyles = [];
  _isLn = false;
  _spacingConfig = { text: " ", useDefaultStyles: false, inheritStyle: false };

  // --- Centralized Error Logging ---
  _logError(context, error) {
      try {
          // Use console.error for semantic correctness and potential separate stream handling
          const prefix = `${ANSIStyles.red}${ANSIStyles.underline}color-print error${ANSIStyles.reset}${ANSIStyles.red} [${context}]:\n${ANSIStyles.reset}`;
          const errorStack = error instanceof Error ? `${error.stack}` : '';
          console.error(prefix + `${ANSIStyles.red}${errorStack}${ANSIStyles.reset}`);
      } catch (logError) {
          // Fallback if even error logging fails
          console.error("color-print internal error: Failed to log previous error.", logError);
          console.error("Original error context:", context);
          console.error("Original error:", error);
      }
  }

  constructor(isLnArg, optionsArg) {
      try { // Wrap constructor logic
          this._isLn = !!isLnArg;

          // Ensure options is a valid object
          if (typeof optionsArg !== 'object' || optionsArg === null) {
              if (optionsArg !== undefined) { // Log if non-object was passed, but not if just undefined
                 this._logError('constructor', new TypeError(`Invalid options argument provided. Expected object, got ${typeof optionsArg}.`));
              }
              this._options = {};
          } else {
               this._options = optionsArg;
          }

          // Validate and set default styles
          const defaultStylesSource = this._options.defaultStyles;
          if (defaultStylesSource && !Array.isArray(defaultStylesSource)) {
              this._logError('constructor', new TypeError(`Invalid 'defaultStyles' option. Expected array, got ${typeof defaultStylesSource}.`));
              this._instanceStyles = [];
          } else {
              this._instanceStyles = defaultStylesSource ? [...defaultStylesSource] : [];
          }

          // Validate and set spacing options
          try {
               const spacingOpt = this._options.spacing;
               this._spacingConfig = {
                   text: (spacingOpt && typeof spacingOpt.text === 'string') ? spacingOpt.text : " ",
                   useDefaultStyles: (spacingOpt && spacingOpt.useDefaultStyles === true),
                   inheritStyle: (spacingOpt && spacingOpt.inheritStyle === true && !(spacingOpt.useDefaultStyles === true))
               };
               if (spacingOpt && typeof spacingOpt !== 'object') {
                    throw new TypeError(`Invalid 'spacing' option. Expected object, got ${typeof spacingOpt}.`);
               }
          } catch(e) {
               this._logError('constructor spacing options', e);
               this._spacingConfig = { text: " ", useDefaultStyles: false, inheritStyle: false }; // Reset to default on error
          }


          // Validate and attach custom styles
          const customStylesSource = this._options.customStyles;
          if (customStylesSource) { // Only process if it exists
               if (typeof customStylesSource !== 'object' || customStylesSource === null) {
                   this._logError('constructor', new TypeError(`Invalid 'customStyles' option. Expected object, got ${typeof customStylesSource}.`));
               } else {
                   try { // Wrap the loop itself
                       const customStyleKeys = Object.keys(customStylesSource);
                       customStyleKeys.forEach(customStyleName => {
                           const styleCode = customStylesSource[customStyleName];
                           if (typeof styleCode !== 'string' || styleCode === '') {
                               // Log warning instead of error for invalid individual styles
                               console.warn(`${ANSIStyles.yellow}color-print warning: Invalid or empty code for custom style '${customStyleName}'. Skipping.${ANSIStyles.reset}`);
                               return; // Skip this style
                           }
                           if (typeof this[customStyleName] === 'undefined') {
                               this[customStyleName] = function(...args) {
                                   // Add try-catch within the method call itself for safety
                                   try {
                                       return this._applyStyleInternal(styleCode, ...args);
                                   } catch(e) {
                                       this._logError(`custom style '${customStyleName}' execution`, e);
                                       return undefined; // Prevent crashing chain on style method error
                                   }
                               };
                           } else {
                                console.warn(`${ANSIStyles.yellow}color-print warning: Custom style '${customStyleName}' conflicts with existing property. Skipping.${ANSIStyles.reset}`);
                           }
                       });
                   } catch (e) {
                       this._logError('attaching custom styles', e);
                   }
               }
          }

           // Validate typeHandlers (check if values are functions)
           const typeHandlersSource = this._options.typeHandlers;
           if (typeHandlersSource) {
               if (typeof typeHandlersSource !== 'object' || typeHandlersSource === null) {
                    this._logError('constructor', new TypeError(`Invalid 'typeHandlers' option. Expected object, got ${typeof typeHandlersSource}.`));
               } else {
                   Object.keys(typeHandlersSource).forEach(key => {
                       if (typeof typeHandlersSource[key] !== 'function') {
                           this._logError('constructor typeHandlers', new TypeError(`Invalid handler for type '${key}'. Expected function, got ${typeof typeHandlersSource[key]}. Handler ignored.`));
                           delete typeHandlersSource[key]; // Remove invalid handler
                       }
                   });
               }
           }


      } catch (e) { // Catch errors during initial setup
          this._logError('constructor critical setup', e);
          // Ensure basic defaults exist even if setup failed, to prevent later crashes on method calls
          this._options = {};
          this._instanceStyles = [];
          this._isLn = false;
          this._spacingConfig = { text: " ", useDefaultStyles: false, inheritStyle: false };
      }


      // --- Create and return wrapper ---
      // This part should be safe if constructor logic above handles errors gracefully
      const instance = this;
      const printer = (...args) => {
           try {
               if (args.length > 0) {
                   instance._printInternal(...args);
               } else if (instance._isLn) {
                   // Use internal method for consistency if needed, but console.log is likely safe
                   console.log("");
               }
               // Create clean instance *carefully*
               const nextPrinter = instance._createCleanInstanceInternal();
               return nextPrinter;
           } catch(e) {
               instance._logError('wrapper function', e);
               // Return a non-crashing dummy function maybe? Or just undefined.
               // Returning undefined clearly breaks the chain.
               return undefined;
           }
      };
      Object.setPrototypeOf(printer, instance);
      return printer;
  }

  _createCleanInstanceInternal() {
      try { // Wrap instance creation
           // Pass the potentially cleaned/validated options reference
          const newWrapper = new Printer(this._isLn, this._options);
          return newWrapper;
      } catch(e) {
          this._logError('_createCleanInstanceInternal', e);
          // Return a dummy/broken instance? Or undefined?
          return undefined; // Break chain on creation error
      }
  }

  _createChainedInstanceInternal() {
      try { // Wrap instance creation
          const ln = this._isLn;
          const opts = this._options; // Pass validated options reference
          const newWrapper = new Printer(ln, opts);
          const newInstance = Object.getPrototypeOf(newWrapper);
          // Copy styles state (safe operation)
          newInstance._instanceStyles = [...this._instanceStyles];
          return newWrapper;
       } catch(e) {
          this._logError('_createChainedInstanceInternal', e);
          return undefined; // Break chain on creation error
      }
  }

  _printInternal(...args) {
      let didErrorOccur = false; // Flag to prevent style reset if error happened mid-print
      try {
          const currentOptions = this._options;
          const spacingConfig = this._spacingConfig;
          const defaultStyles = Array.isArray(currentOptions.defaultStyles) ? currentOptions.defaultStyles : [];

          if (args.length === 1 && args[0] === "" && this._isLn) {
              console.log("");
              // Style reset happens in finally block
              return;
          }

          const typeHandlers = currentOptions.typeHandlers || {};
          const formatted = args.map(arg => {
              let processedArg = null;
              try { // Wrap individual argument processing
                  const type = arg === null ? "null" : Array.isArray(arg) ? "array" : typeof arg;
                  const handler = typeHandlers.hasOwnProperty(type) ? typeHandlers[type] : null;

                  if (handler) {
                      processedArg = handler(arg); // User-provided function
                      // Validate handler output
                      if (!processedArg || typeof processedArg.text !== 'string') {
                           throw new TypeError(`Type handler for type '${type}' returned invalid value. Expected { text: string, styles?: string[] }.`);
                      }
                       // Use provided styles or fallback to current instance styles
                      processedArg.styles = Array.isArray(processedArg.styles) ? processedArg.styles : (this._instanceStyles || []);
                  } else {
                      // Default: convert to string and use current styles
                      processedArg = { text: String(arg), styles: this._instanceStyles || [] };
                  }
              } catch (e) {
                  didErrorOccur = true;
                  this._logError(`processing argument (type: ${typeof arg})`, e);
                  // Fallback formatting on error
                  processedArg = {
                      text: `[ERROR processing value: ${String(arg).substring(0, 50)}${String(arg).length > 50 ? '...' : ''}]`,
                      styles: [ANSIStyles.red] // Basic error style
                  };
              }
              // Ensure styles is always an array post-processing/catch
              processedArg.styles = Array.isArray(processedArg.styles) ? processedArg.styles : [];
              return processedArg;
          });

          const nonEmptyFormatted = formatted.filter(f => f.text !== "");

          let outputParts = [];
          for (let i = 0; i < nonEmptyFormatted.length; i++) {
              const currentFormatted = nonEmptyFormatted[i];
              outputParts.push(`${currentFormatted.styles.join("")}${currentFormatted.text}${ANSIStyles.reset}`);

              if (i < nonEmptyFormatted.length - 1) {
                  let separatorStyles = [];
                  if (spacingConfig.useDefaultStyles) {
                      separatorStyles = defaultStyles;
                  } else if (spacingConfig.inheritStyle) {
                      separatorStyles = currentFormatted.styles;
                  }
                  // Join safely, ensuring array elements are strings
                  const joinedSepStyles = Array.isArray(separatorStyles) ? separatorStyles.join("") : "";
                  outputParts.push(`${joinedSepStyles}${spacingConfig.text}${ANSIStyles.reset}`);
              }
          }
          const output = outputParts.join("");

          try { // Wrap console output specifically
              if (output || this._isLn) {
                  if (this._isLn) console.log(ANSIStyles.reset+output);
                  else if (output) process.stdout.write(ANSIStyles.reset+output);
              }
          } catch (e) {
               didErrorOccur = true;
               this._logError('console output', e);
          }

      } catch (e) { // Catch broader errors in _printInternal
           didErrorOccur = true;
           this._logError('_printInternal', e);
      } finally {
          // Always reset styles *unless* an error occurred mid-way through this specific print call
          // This prevents a partial print leaving the instance in a weird state for the *next* call
          if (!didErrorOccur) {
               try {
                   this._instanceStyles = Array.isArray(this._options?.defaultStyles) ? [...this._options.defaultStyles] : [];
               } catch(e) {
                    // If even resetting styles fails, log it but don't crash
                    this._logError('resetting styles in finally', e);
                    this._instanceStyles = []; // Hard reset
               }
          }
      }
  }


  _applyStyleInternal(styleCode, ...args) {
       try { // Wrap the entire style application logic
           if (typeof styleCode !== 'string' || styleCode === '') {
               // This should ideally be caught earlier, but added as safety
               throw new TypeError('Invalid styleCode received by _applyStyleInternal.');
           }

          const nextWrapper = this._createChainedInstanceInternal();
          // If creation failed, nextWrapper will be undefined
          if (!nextWrapper) {
              throw new Error("Failed to create chained instance in _applyStyleInternal.");
          }

          const nextInstance = Object.getPrototypeOf(nextWrapper);
          nextInstance._instanceStyles.push(styleCode);

          if (args.length > 0) {
              // If args are provided, print immediately using the new state
              const result = nextWrapper(...args);
              // If the wrapper call itself failed, result might be undefined
              return result;
          } else {
              // If no args, return the new wrapper for further chaining
              return nextWrapper;
          }
      } catch(e) {
          this._logError('_applyStyleInternal', e);
          // Return undefined to explicitly break the chain on error
          return undefined;
      }
  }
}

// --- Add standard style methods to prototype ---
// Wrap these calls as well for extra safety
Object.keys(ANSIStyles).forEach(styleName => {
if (styleName !== 'reset') {
  Printer.prototype[styleName] = function(...args) {
      try {
          return this._applyStyleInternal(ANSIStyles[styleName], ...args);
      } catch (e) {
          // Log error originating from standard style method call
          this._logError(`standard style '${styleName}'`, e);
          return undefined; // Break chain
      }
  };
}
});

// --- RGB/256 methods ---
// Wrap these too
Printer.prototype.rgb = function(r, g, b, ...args) {
  try { return this._applyStyleInternal(`\x1b[38;2;${r};${g};${b}m`, ...args); }
  catch(e) { this._logError('rgb method', e); return undefined; }
};
Printer.prototype.bg_rgb = function(r, g, b, ...args) {
  try { return this._applyStyleInternal(`\x1b[48;2;${r};${g};${b}m`, ...args); }
  catch(e) { this._logError('bg_rgb method', e); return undefined; }
};
Printer.prototype.fg = function(color, ...args) {
  try { return this._applyStyleInternal(`\x1b[38;5;${color}m`, ...args); }
  catch(e) { this._logError('fg method', e); return undefined; }
};
Printer.prototype.bg = function(color, ...args) {
  try { return this._applyStyleInternal(`\x1b[48;5;${color}m`, ...args); }
  catch(e) { this._logError('bg method', e); return undefined; }
};


// --- Export concrete classes ---
// Constructors inherently call the wrapped Printer constructor
export class PrintLn extends Printer {
constructor(options) { super(true, options); }
}
export class Print extends Printer {
constructor(options) { super(false, options); }
}