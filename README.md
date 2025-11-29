# The Digital Shield — Prototype

This is a small static prototype recreating the screenshot you provided. It includes a header with tabs and a hero section with an SVG shield and explanatory text.

Open `index.html` in your browser to view:

For Windows PowerShell:

```powershell
Start-Process -FilePath "index.html"
```

Or just double-click `index.html` in the `web_shield` folder.

Files:
- `index.html` — markup and inline SVGs
- `styles.css` — styles and layout
- `script.js` — tab switching logic

Next steps I can help with:
- Replace the inline SVG with your real logo image (done: there's now a placeholder)
- Add image assets and gallery items
- Improve responsiveness or add animations

Where to put your logo:
- The page currently loads `logo-placeholder.svg` from the same folder as `index.html`.
- To use your own logo, replace `logo-placeholder.svg` with your file (same filename), or update the `src` on the `<img id="site-logo">` element in `index.html` to point at your file (for example `images/my-logo.png`).

Example: if you put `mylogo.png` in a subfolder named `images`, edit `index.html` and change:

```html
<img id="site-logo" src="logo-placeholder.svg" alt="The Digital Shield logo">
```

to:

```html
<img id="site-logo" src="images/mylogo.png" alt="The Digital Shield logo">
```

No other code changes are required. The placeholder SVG ensures the page never shows a broken image.

Adjusting logo sizes
- CSS variables: open `styles.css` and edit these variables near the top in the `:root` block:

	- `--site-logo-width` and `--site-logo-height` (default `48px`) control the header logo.
	- `--hero-logo-width` and `--hero-logo-height` (default `320px`) control the large hero logo.

	Example (in `styles.css`):

	```css
	:root{
		--site-logo-width:64px;
		--site-logo-height:64px;
		--hero-logo-width:360px;
		--hero-logo-height:360px;
	}
	```

Live UI control panel
- A small live control panel has been added to the bottom-right of the page. Use it to preview and set logo sizes without editing files.

How it works:
- The panel reads current CSS variables for `--site-logo-width`, `--site-logo-height`, `--hero-logo-width`, and `--hero-logo-height` and fills the inputs on load.
- Click "Apply" to update sizes (this calls the same `setLogoSize()` helper used by the page).
- Click "Reset" to restore the original stylesheet values.

Tip: If you prefer to manage sizes only from `styles.css`, remove the `data-width`/`data-height` attributes from the `<img>` tags in `index.html` and reload the page.

Persistence
- The control panel saves your values and the panel collapsed/expanded state to `localStorage` so they persist across reloads.
- To clear saved values you can either click the panel's "Reset" button (it restores stylesheet defaults and clears saved settings) or clear the site data in your browser.

- Data attributes: you can set `data-width` and `data-height` directly on the `<img>` tags in `index.html` (values in pixels or CSS units). These override the CSS defaults on page load.
 - Data attributes: you can set `data-width` and `data-height` directly on the `<img>` tags in `index.html` (values in pixels or CSS units). On page load these are now used to set the CSS variables (not inline styles). That means:

	 - If you REMOVE the `data-` attributes, the values in `styles.css` will apply on reload.
	 - If `data-` attributes are present, they will override the CSS defaults by updating the corresponding CSS variables.

	 Example:

	 ```html
	 <img id="site-logo" src="logo-placeholder.svg" data-width="64" data-height="64">
	 <img id="hero-logo" src="logo-placeholder.svg" data-width="360" data-height="360">
	 ```

 - JavaScript helper: from the browser console or other scripts you can call `setLogoSize(id, width, height)` to update sizes at runtime. By default this updates the CSS variables (so changes flow through your stylesheet). Pass a fourth argument `false` to set inline styles instead.

	 Example (console):

	 ```js
	 // update CSS variables (recommended)
	 setLogoSize('site-logo', 72, 72);

	 // update only width using CSS variable
	 setLogoSize('hero-logo', '40vw', null);

	 // set inline styles directly (not via CSS variables)
	 setLogoSize('site-logo', 100, 100, false);
	 ```
