.PHONY: build copy

HASH = $(shell git rev-parse HEAD)
CURRENT_BRANCH = $(shell git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/')

UGLIFY = node_modules/.bin/uglifyjs
BABEL = node_modules/.bin/babel

build: output transpile minify 

output:
	mkdir -p output

transpile:
	$(BABEL) index.js > output/formson.js

minify:
	$(UGLIFY) --compress --mangle --comments /FORMSON/ -- output/formson.js > output/formson.min.js


publish:
	rm -rf output/index.html
	echo '<html><body>' >> output/index.html
	echo '<style>*{font-family:sans-serif;}</style>' >> output/index.html
	echo "<h1>$(HASH)</h1>" >> output/index.html
	echo '<ul>' >> output/index.html
	echo '<li><a href="formson.js">formson.js</a></li>' >> output/index.html
	echo '<li><a href="formson.min.js">formson.min.js</a></li>' >> output/index.html
	echo '</ul>' >> output/index.html
	echo '</body></html>' >> output/index.html

	surge ./output "formson-$(HASH).surge.sh"

	rm -rf output/index.html
	echo '<html><body>' >> output/index.html
	echo '<style>*{font-family:sans-serif;}</style>' >> output/index.html
	echo "<h1>HEAD of $(CURRENT_BRANCH) (<a href='https://formson-$(HASH).surge.sh/'>$(HASH)</a>)</h1>" >> output/index.html
	echo '<ul>' >> output/index.html
	echo '<li><a href="formson.js">formson.js</a></li>' >> output/index.html
	echo '<li><a href="formson.min.js">formson.min.js</a></li>' >> output/index.html
	echo '</ul>' >> output/index.html
	echo '</body></html>' >> output/index.html

	surge ./output "formson-$(CURRENT_BRANCH).surge.sh"
