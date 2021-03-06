.PHONY: css html js	index.html

all: index.html
#	#watch -n 1 make index.html

index.html: index.haml logo.haml
	haml index.haml > index.html

view:
	chromium-browser index.html &

html:
	emacs index.html &

css:
	emacs css/main.css &

js:
	emacs artisanal-boxes.js

commit:
	@-make push

push:
	make
	git add Makefile README.md
	git add *.js css/*.css *.html *.haml
	git status
	git commit -a
	git push

clean:
	find . -name "*~" | xargs -I {} rm {}
	find . -name "\#" | xargs -I {} rm {}

#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
# Build dependencies (if needed)
#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=

build_deps:
	git submodule init 
	git submodule update

