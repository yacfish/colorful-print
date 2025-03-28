# Colorful Print

A Node.js module for stylish terminal output with chaining, customization, and flexible argument handling.

---
## Features

- **Chainable Styles**: Combine colors and effects like `println.red.bold("text")`.
- **Dual Print Modes**: `PrintLn` for newlines, `Print` for inline output.
- **Rich Color Options**: Standard colors, bright colors, backgrounds, 256-color mode, and true RGB colors.
- **Text Styles**: Bold, underline, italic, dim, inverse, strikethrough, and more.
- **Default Styles**: Apply base styling to all outputs from an instance.
- **Type Handling**: Customize how strings, numbers, objects, etc., are displayed, including overriding chained styles.
- **Custom Styles**: Define your own reusable style shortcuts.
- **Custom Spacing**: Control the text and styling of the space between multiple arguments.

---
## Installation

```bash
# Make sure you have Node.js installed
npm install colorful-print
```

Or clone this repo and use it locally:
```bash
# In the colorful-print directory
npm link

# In your project directory
npm link colorful-print
```

---
## Quick Start

```javascript
import { PrintLn } from 'colorful-print';

const println = new PrintLn();
println.red().bold("Hello, colorful world!");
// Output: "Hello, colorful world!" (in red and bold, with newline)
```

---
## Usage Examples
### Basic Printing
#### PrintLn (With Newline)

```javascript
import { PrintLn } from 'colorful-print';

const println = new PrintLn();
println("Plain text");
println.red("Red text");
println.green().bold("Green and bold");
```
Output:
```text
Plain text
Red text            // In red
Green and bold      // In green and bold
```
---
#### Print (Without Newline)

```javascript
import { Print } from 'colorful-print';

const print = new Print();
print.blue("Inline ");
print.yellow().bg_red("mixed");
print(" text");
print("\n"); // Manual newline
```
Output:
```text
Inline mixed text   // "Inline" (blue) "mixed" (yellow on red) "text" (plain)
```
Note how "text" is plain because styles were reset after printing "mixed ".

---
## Color Options
#### Standard Colors

```javascript
println.black("Black");
println.red("Red");
println.green("Green");
println.yellow("Yellow");
println.blue("Blue");
println.magenta("Magenta");
println.cyan("Cyan");
println.white("White");
```

---
#### Bright Colors

```javascript
println.bright_black("Bright black (gray)");
println.bright_red("Bright red");
println.bright_green("Bright green");
println.bright_yellow("Bright yellow");
println.bright_blue("Bright blue");
println.bright_magenta("Bright magenta");
println.bright_cyan("Bright cyan");
println.bright_white("Bright white");
```

---
#### Background Colors
```javascript
println.bg_black("Black background");
println.bg_red("Red background");
println.bg_green().white("Green background, white text");
println.bg_bright_yellow("Bright yellow background");
println.bg_bright_cyan().bright_white("Bright cyan bg, bright white text");
```

---
#### 256-Color Mode
```javascript
println.fg(208)("Orange (256-color)");
println.fg(208,"Also orange (256-color)"); //alternative syntax
println.bg(55)("Purple background (256-color)");
println.fg(214).bold("Bold orange");
```
Use numbers 0–255 for fg (foreground) and bg (background).

---
#### True Color (RGB)

```javascript
println.rgb(255, 165, 0)("True orange");
println.rgb(255, 165, 0,"True orange"); //alternative syntax
println.bg_rgb(0, 255, 0)("True green background");
println.rgb(128, 0, 128).bold("Purple bold text");
```
Use RGB values (0–255) for precise color control.

---
#### Text Styles

```javascript
println.bold("Bold");
println.underline("Underline");
println.italic("Italic"); // Terminal support varies
println.inverse("Inverse");
println.dim("Dim");
println.blink("Blink"); // Terminal support varies
println.blink_fast("Blink Fast"); // Terminal support varies
println.strikethrough("Strikethrough"); // Terminal support varies
```

---
## Available Styles (ANSIStyles)
The following style keys are available as chainable methods (e.g., println.red()) and as constants within the exported ANSIStyles object (e.g., ANSIStyles.red).

### Foreground Colors
- black
- red
- green
- yellow
- blue
- magenta
- cyan
- white
- bright_black (Gray)
- bright_red
- bright_green
- bright_yellow
- bright_blue
- bright_magenta
- bright_cyan
- bright_white

### Background Colors
- bg_black
- bg_red
- bg_green
- bg_yellow
- bg_blue
- bg_magenta
- bg_cyan
- bg_white
- bg_bright_black
- bg_bright_red
- bg_bright_green
- bg_bright_yellow
- bg_bright_blue
- bg_bright_magenta
- bg_bright_cyan
- bg_bright_white

### Text Formatting
- bold
- dim
- italic (Terminal support varies)
- underline
- inverse
- strikethrough (Terminal support varies)
- blink (Terminal support varies)
- blink_fast (Terminal support varies)
- hidden (Makes text invisible)

### Reset
- reset (Available in ANSIStyles.reset, not as a chainable method) - Used internally to end styling.

### Special Methods
- fg(color_code): Apply 256-color foreground.
- bg(color_code): Apply 256-color background.
- rgb(r, g, b): Apply RGB foreground. (Terminal support varies)
- bg_rgb(r, g, b): Apply RGB background. (Terminal support varies)

---
## Combining Styles
Chain multiple styles together. Styles accumulate for the next print operation.

```javascript
println.red.bold().underline("Red, bold, underlined");
println.bg_green().bright_white().inverse("Green bg, white, inverted");
print.cyan().blink().bold("Cyan mix ");
print.bg_rgb(255, 0, 0).underline("Red bg, underlined");
print("\n");
```

---
## Custom Instantiation
Create instances with specific configurations.

---

### Custom Styles
Add your own ANSI styles:

```javascript
const printlnCustom = new PrintLn({
  customStyles: { // Note: key is 'customStyles'
    orange: "\x1b[38;5;208m", // 256-color orange
    bg_purple: "\x1b[48;5;55m", // 256-color purple background
    warning: ANSIStyles.yellow + ANSIStyles.bold // Combine existing styles
  }
});

printlnCustom.orange("Custom orange text!");
printlnCustom.bg_purple().white("White text on custom purple background.");
printlnCustom.warning("Warning: ", "This is important.");
```

---
### Custom Type Handlers
Define functions to format specific JavaScript types:

```javascript
const printlnTyped = new PrintLn({
  defaultStyles: [ANSIStyles.dim], // Example base style
  typeHandlers: {
    // Handler receives the argument, returns { text: string, styles?: string[] }
    string: (arg) => ({
      text: arg.toUpperCase(),
      // No 'styles' key means default/chained styles are used (dim in this case)
    }),
    number: (arg) => ({
      text: `[${arg.toFixed(2)}]`,
      styles: [ANSIStyles.blue] // These styles REPLACE default/chained styles for this arg
    }),
    object: (arg) => ({
      text: JSON.stringify(arg),
      styles: [ANSIStyles.red, ANSIStyles.bold] // Red and bold, replaces dim
    }),
    boolean: (arg) => ({
      text: arg ? "YES" : "NO",
      styles: [ANSIStyles.green] // Green, replaces dim
    })
    // Other types (e.g., array, null) will use default/chained styles (dim)
  }
});

printlnTyped("all_caps", 123.4567, { balance: 1E10 }, true, "     ",['list','of','stuff']);                     

```
Output:
```text
HELLO [123.46] {"balance":10000000000} YES       list,of,stuff
(dim) (blue)   (red,bold)              (green)   (dim)                       
```

Key points for Type Handlers:
- The handler function receives the argument (arg).
- It must return an object `{ text: string, styles?: string[] }`.
- If styles array is provided in the return object, it completely overrides any default or chained styles for that specific argument.
- If styles key is omitted, the argument's text will use the currently active default/chained styles.

---
### Custom Spacing
Control the separator between multiple arguments printed in a single call.
#### Overriding default separator
```javascript
const printlnSpaced1 = new PrintLn({
  defaultStyles: [ANSIStyles.underline],
  spacing: {
    text: " | " // Separator string override (default is " ")
  }
});

printlnSpaced1.red("A","B","C"); // Separator is replaced but not styled
//Output : 'A | B | C' with letters in red and underlined and " | " seperators not styled  
```
#### Overriding default separator and using default styles with `useDefaultStyles: true`
```javascript
const printlnSpaced2 = new PrintLn({
  defaultStyles: [ANSIStyles.underline, ANSIStyles.yellow],
  spacing: {
    text: " | ", 
    useDefaultStyles: true, // Style separator with options.defaultStyles (underline+yellow)
  }
});

printlnSpaced2.red("A","B","C");
//Output : 'A | B | C' all in red and underlined  
```
#### Overriding default separator and using default styles with `inheritStyle: true`
```javascript
const printlnSpaced3 = new PrintLn({
  defaultStyles: [ANSIStyles.underline, ANSIStyles.yellow],
  spacing: {
    text: " -> ", // Separator string override (default is " ")
    inheritStyle: true,    // Style separator like the preceding argument
  },
  typeHandlers: {
    string: (arg) => ({ text: arg.toUpperCase(), styles: [ANSIStyles.green] }),
    number: (arg) => ({ text: `[${arg.toFixed(2)}]`, styles: [ANSIStyles.blue] }),
    null: (arg) => ({ text: "NULL", styles: [ANSIStyles.red] })
  }
});

printlnSpaced3(null,1,"two",[3,4,5]);
//Output : 'NULL -> [1.00] -> TWO -> 3,4,5' with 'NULL -> ' in red, '[1.00] -> ' in blue, 'TWO -> ' in green, '3,4,5' in yellow and underlined
printlnSpaced3.magenta(null,1,"two",[3,4,5]);
//Output : 'NULL -> [1.00] -> TWO -> 3,4,5' with 'NULL -> ' in red, '[1.00] -> ' in blue, 'TWO -> ' in green, '3,4,5' in magenta and underlined
```
Precedence: `useDefaultStyles: true` overrides `inheritStyle: true` if both are set.

---
## Error Handling
This module is designed to be resilient and avoid crashing your application due to common configuration or runtime issues.
- Error Logging: When errors occur (e.g., invalid options, failing type handlers, internal issues), they are logged to console.error.
- Error Format: Logged errors are prefixed with color-print module error (<context>): and printed in red and underlined text for visibility. Stack traces are included when available.
- Graceful Failure: Instead of throwing exceptions that might halt your program, the module attempts to:
- Use safe default values if configuration options are invalid.
- Log issues with specific type handlers or custom styles and continue processing other arguments or calls.
- Print a fallback error message for arguments that failed during processing.
- Chain Breaking: If a critical error occurs that prevents a method (like a style application or instance creation) from returning a valid, chainable Printer object, it will typically return undefined. This safely breaks the method chain, preventing further errors down the line, although you will lose the intended output for that chain.

```javascript
const printlnBadHandler = new PrintLn({
  typeHandlers: {
    number: (arg) => { throw new Error("Handler Failed!"); } // This handler throws
  }
});

printlnBadHandler.blue("Processing:", 123, "Done.");
// Output:
// - "color-print module error" in red and underlined and "(processing argument (type: number)):" in red.
// - "Error: Handler Failed!\nat ..." in red.
// - "Processing:" in blue.
// - "[ERROR processing value: 123]" in red.
// - "Done." in blue.
// - The program will NOT crash.
```

---
## Notes
- Terminal Support: Style rendering (especially italic, blink) depends on the terminal emulator. Modern terminals (like Windows Terminal, iTerm2, VS Code integrated terminal) generally offer good support. Classic Windows CMD has limited capabilities.
- Style Reset: Styles set via chaining (.red(), .bold(), etc.) apply only to the next print operation. This could be arguments passed directly to the style method (e.g., .red("text")) or the next call on the returned styled object (e.g., .red()("text")). Crucially, after any text is output using either Print or PrintLn, the instance's styles are automatically reset back to its defaultStyles (or to none if no defaults were configured). To apply styles to multiple distinct print calls, you must re-apply the desired styles before each call.
- ANSI Codes: Custom styles require valid ANSI escape codes. Refer to resources online for a full list.
- Error Handling: See the "Error Handling" section for details on how the module manages internal errors and invalid configurations.

---
## Contributing
Found a bug or have a feature idea? Open an issue or PR on [GitHub](https://github.com/yacfish/colorful-print)!

---
## License
MIT © Yacine Sebti 2025