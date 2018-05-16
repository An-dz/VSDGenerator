# Vivaldi Speed Dial Generator

This extension makes the [Vivaldi browser](https://vivaldi.com/) automatically generate a cool Speed Dial image based on possible graphics defined in the meta or link tags, instead of generating a picture of the page.

![Preview of some generated speed dials](https://github.com/An-dz/VSDGenerator/raw/master/GeneratedSD.png)

# Installing

1) Head to the [releases page](https://github.com/An-dz/VSDGenerator/releases)
2) Download the latest version CRX file anywhere in your computer
3) Open Vivaldi
4) Open the extensions page <vivaldi://extensions/>
5) Drag the CRX file inside the Extensions page

# How to use it

Just install the extension and reload your Speed Dial images, nothing more.

Just notice that since there are certain websites that link to non-existent resources the extension checks the resources before using them, this slows down the script execution and the generation may not fire. To be sure you don't fall for this problem make sure to cache the page first by visiting it before creating an image.

**Will this work on another browser or Speed Dial extension?**

Probably not. This extension uses a singularity of Vivaldi Speed Dial generation to inject itself and this is probably not the same on other browsers or extensions.
