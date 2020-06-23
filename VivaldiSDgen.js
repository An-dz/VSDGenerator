document.addEventListener("DOMContentLoaded", function () {
	if (window.innerHeight !== 838 || window.innerWidth !== 1024 || window.innerHeight !== window.outerHeight || window.innerWidth !== window.outerWidth) {
		return;
	}

	// background colour
	let color = "#FFFFFF";
	// centralise logos, don't centralise og:image & twitter:image
	const isLogo = [ true, true, false, false, true, true, true ];
	// node selectors
	const images = [
		// SVG icons, excellent quality
		"link[sizes='any']",
		"link[rel='mask-icon']",
		// high quality images
		"meta[property='og:image']",
		"meta[name='twitter:image']",
		// find large size logo
		"link[rel*='icon'][sizes]",
		// MS tile, good guaranteed quality
		"meta[name='msapplication-TileImage']",
		// rely on low quality apple icon
		"link[rel='apple-touch-icon']"
	];

	/* Find background colour */
	let colorMeta = document.querySelector("meta[name='theme-color']");

	if (colorMeta !== null) {
		color = colorMeta.getAttribute("content");
		// console.log("theme-color:", color);
	}

	let fav = document.querySelector("link[rel~='icon']");
	const favicon = new Image();
	favicon.onload = function () {
		// console.log("@ ==>", fav, favicon.height);
		if (fav === 0 && favicon.height > 48) {
			createSD(favicon.src, 0);
		}
	};

	if (fav !== null) {
		favicon.src = fav.href;
	} else {
		favicon.src = "/favicon.ico";
	}

	/* Build the SD image */
	function createSD(src, i) {
		// console.log("\tCreate SD:", src, i, color);

		if (i === 1) {
			colorMeta = document.querySelector("link[rel='mask-icon']");

			if (colorMeta !== null) {
				color = colorMeta.getAttribute("color");
				// console.log("mask-icon", color);
			}
		}
		else if (i === 5) {
			colorMeta = document.querySelector("meta[name='msapplication-TileColor']");

			if (colorMeta !== null) {
				color = colorMeta.getAttribute("content");
				// console.log("TileColor", color);
			}
		}

		// set style
		const node = document.createElement("style");
		node.type = "text/css";
		node.appendChild(document.createTextNode(`
			html, body {
				height: 100% !important;
				margin: 0 !important;
				padding: 0 !important;
				background-color: ${color} !important;
			}
			body {
				background-image: url('${src}') !important;
				background-position: center !important;
				background-size: ${isLogo[i] ? "auto 50%" : "cover"} !important;
				background-repeat: no-repeat !important;
			}
			html > :not(body), body * {
				display: none !important;
			}`));
		document.head.appendChild(node);

		// clean body
		document.body.innerHTML = "";
	}

	/* Search for element, check its existence and loop if necessary */
	function getImage(selector, i) {
		// console.log("@ ==>", selector)

		// fourth selector, check all image sizes
		if (i === 5 && selector.includes("[sizes]")) {
			const logos = document.querySelectorAll("link[rel*='icon'][sizes]");
			let maxsize = 0;

			logos.forEach(function (l) {
				const size = parseInt(l.getAttribute("sizes"), 10);
				maxsize = (maxsize < size) ? size : maxsize;
			});

			// if found size is acceptable we choose it
			if (maxsize > 48) {
				return getImage("link[sizes='" + maxsize + "x" + maxsize + "']", i);
			}

			// nothing acceptable found, go to next check
			return getImage(images[i], ++i);
		}

		const logo = document.querySelector(selector);

		// console.log("\tNode:", logo);

		if (i > images.length) {
			fav = 0;
			return null;
		}

		if (!logo) {
			return getImage(images[i], ++i);
		}

		const src = (logo.href !== undefined) ? logo.href : logo.content;

		return fetch(src).then(function (ans) {
			// console.log("\tAnswer:", ans);

			if (!ans.ok) {
				return getImage(images[i], ++i);
			}

			// console.log("\t# Finished #");

			return createSD(src, --i);
		}).catch(error => getImage(images[i], ++i));
	}

	/* Start logo search */
	// console.log("@ Started @");

	getImage(images[0], 1);
});
