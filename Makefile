.PHONY: build

build: 
	yarn grippenet

html:
	python scripts/build-html.py --debug

