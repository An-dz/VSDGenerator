"use strict";

const customChecker = [];

/**
 * Enumeration for different types
 */
const powers = {
	colour: {
		custom: 4,
		theme_color: 3,
		mask_icon: 2,
		ms_tile_color: 1,
	},
	image: {
		// for custom getters so it's not overwritten by others
		custom: 7,
		// social media image, probably related with content
		// meta[property="og:image"]
		og_image: 6,
		// social media image, probably related with content
		// meta[name="twitter:image"]
		twitter: 5,
		// SVG icon, excellent quality
		// link[sizes="any"]
		svg: 4,
		// high probability of an SVG icon
		// link[rel="mask-icon"]
		mask_icon: 3,
		// icons with defined sizes, some apple icons might fall here
		// link[sizes]
		icon_sizes: 2,
		// MS tile, good guaranteed quality of 144px
		// meta[name="msapplication-TileImage"]
		ms_tile_image: 2.0144,
		// could be anything from 1px to infinity
		// we assume the old iPhone 1 57px
		// link[rel="apple-touch-icon"]
		apple: 2.0057,
		// favicon for the rescue
		favicon: 1,
		favicon_ico: 0.5,
	},
};

const SD_data = {
	colour: {
		power: 0,
	},
	image: {
		power: 0,
		list: [],
	},
};

async function testImage(prev_power, src) {
	// console.log("Testing Image...", src);
	let response;
	try {
		response = await fetch(src, {method: "HEAD"});
		console.log(response);

		if (!response.ok) {
			console.log("failed 1");
			SD_data.image.power = prev_power;
			const [list_power, list_src] = SD_data.image.list.pop();
			setImage(list_power, list_src);
		}
	} catch(e) {
		console.log("failed 2");
		console.log(response);
		SD_data.image.power = prev_power;
		const [list_power, list_src] = SD_data.image.list.pop();
		setImage(list_power, list_src);
	}
	// console.log("Finished fetch.");
}

function setBackground(power, colour) {
	if (SD_data.colour.power < power) {
		SD_data.colour.power = power;

		document.getElementById("Vivaldi_SDG_colour").textContent = `
			:root html, :root body {
				background-color: ${colour} !important;
			}
		`;
	}
}

async function setImage(power, src) {
	// const prev_power = SD_data.image.power;

	if (SD_data.image.power < power) {
		// we must check the existence of the image as there are sites
		// dumb enough to put the tag but linked to a dead image
		// await testImage(prev_power, src);

		SD_data.image.power = power;

		const centralise = (
			power < powers.image.custom    &&
			power !== powers.image.twitter &&
			power !== powers.image.og_image
		) ? "auto 50%" : "cover";

		const position = power >= powers.image.custom ? "top center" : "center";

		document.getElementById("Vivaldi_SDG_logo").textContent = `
			:root body {
				background-image: url('${src}') !important;
				background-position: ${position} !important;
				background-size: ${centralise} !important;
				background-repeat: no-repeat !important;
			}
		`;

		return;
	}

	SD_data.image.list.push([power, src]);
	SD_data.image.list.sort((a, b) => (a[0] > b[0]) - (b[0] > a[0]));
}

async function setImageTagAsSD(selector, extraPower) {
	const power = powers.image.custom + (extraPower ? extraPower : 0);

	const imageElement = document.querySelector(selector);

	if (imageElement) {
		await setImage(power, imageElement.src);
		return;
	}

	customChecker.push(async element => {
		if (element.tagName !== "IMG") {
			return;
		}

		const image = document.querySelector(selector);

		if (image) {
			await setImage(power, image.src);
		}
	});
}

function createStyles() {
	const hidder = document.createElement("style");
	hidder.type = "text/css";
	hidder.id = "Vivaldi_SDG_hidder";
	hidder.textContent = `
		:root html, :root body {
			height: 100vh !important;
			margin: 0 !important;
			padding: 0 !important;
			visibility: visible !important;
			opacity: 1 !important;
		}
		html > :not(body), body * {
			display: none !important;
			visibility: hidden !important;
		}
	`;

	const colour = document.createElement("style");
	colour.type = "text/css";
	colour.id = "Vivaldi_SDG_colour";

	const logo = document.createElement("style");
	logo.type = "text/css";
	logo.id = "Vivaldi_SDG_logo";

	document.head.appendChild(hidder);
	document.head.appendChild(colour);
	document.head.appendChild(logo);
}

// check each element loaded in the head
async function metaAnalyser(element) {
	const tagName = element.tagName;

	if (tagName === "LINK") {
		const rel = element.rel;
		const sizes = element.sizes;

		if (sizes.length > 0) {
			let size = 0.0001;

			if (rel === "apple-touch-icon") {
				size = 0;
			}

			if (sizes.value === "any") {
				await setImage(powers.image.svg, element.href);
				return;
			}

			if (sizes.length === 1) {
				size += Number.parseInt(sizes.value, 10);
				await setImage(powers.image.icon_sizes + size / 10000, element.href);
				return;
			}

			let max = 0;

			for (var idx = sizes.length - 1; idx >= 0; idx--) {
				max = Number.max(max, Number.parseInt(sizes[idx], 10));
			}

			await setImage(powers.image.icon_sizes + (max + size) / 10000, element.href);

			return;
		}

		if (rel === "mask-icon") {
			setBackground(powers.colour.mask_icon, element.getAttribute("color"));
			await setImage(powers.image.mask_icon, element.href);
			return;
		}

		if (rel === "apple-touch-icon") {
			await setImage(powers.image.apple, element.href);
			return;
		}

		if (rel.search(/\bicon\b/) > -1) {
			await setImage(powers.image.favicon, element.href);
		}

		return;
	}

	if (tagName === "META") {
		const name = element.name;

		if (element.property === "og:image") {
			await setImage(powers.image.og_image, element.content);
			return;
		}

		switch (name) {
			case "theme-color":
				setBackground(powers.colour.theme_color, element.content);
				break;
			case "msapplication-TileColor":
				setBackground(powers.colour.ms_tile_color, element.content);
				break;
			case "msapplication-TileImage":
				await setImage(powers.image.ms_tile_image, element.content);
				break;
			case "twitter:image":
				await setImage(powers.image.twitter, element.content);
				break;
			default:
		}
	}
}

/* Add custom functions below this line to avoid merge conflicts */


/* Add custom functions above this line to avoid merge conflicts */

/**
 * Custom functions for specific sites
 */
const custom = {
	/*
	 * # Example 1
	 * Getting an image from the page
	 *
	 * ```javascript
	 * "www.example.com": async () => await setImageTagAsSD(".title img"),
	 * ```
	 *
	 * # Example 2
	 * Getting multiple possibilities from the page
	 *
	 * The number as second argument defines which
	 * should be selected if multiple are found,
	 * higher number means higher preference.
	 *
	 * Don't use negative numbers
	 *
	 * ```javascript
	 * "www.example.com": async () => await Promise.all([
	 * 	setImageTagAsSD("img.a", 3),
	 * 	setImageTagAsSD("img.b", 2),
	 * 	setImageTagAsSD("img.c", 1),
	 * 	setImageTagAsSD("img.d", 0),
	 * ]),
	 * ```
	 *
	 * # Example 3
	 * You can also call a more complex function you add above
	 *
	 * For example, you may need to read some custom parameter
	 * because there's a script to lazyload images and the URL
	 * is inside a data-url parameter, or you may need to inject
	 * a script on the page as the image URL itself is lazy loaded,
	 * and you'll need to intercept when this call is done.
	 *
	 * ```javascript
	 * "www.example.com": callSomeThing,
	 * ```
	 */
};

// apply only when generating a SD
if (
	window.innerHeight === 838 &&
	window.innerWidth === 1024 &&
	window.innerHeight === window.outerHeight &&
	window.innerWidth === window.outerWidth
) {
	// check the loading until the head is loaded
	const dom_observer = new MutationObserver(async mutations => {
		mutations.forEach(async change => {
			change.addedNodes.forEach(async element => {
				if (element.tagName === "HEAD") {
					createStyles();
					await setImage(powers.image.favicon_ico, "/favicon.ico");
					custom[window.location.host] && await custom[window.location.host]();
					return;
				}

				await metaAnalyser(element);
				customChecker.forEach(f => f(element));
			});
		});
	});

	dom_observer.observe(document, {childList: true, subtree: true});
}
