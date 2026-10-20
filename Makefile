SHELL := /bin/sh

PYTHON ?= python3
VENV_PYTHON := .venv/bin/python
WORKER_PYTHON := $(if $(wildcard $(VENV_PYTHON)),../$(VENV_PYTHON),$(PYTHON))

.PHONY: install test test-frontend test-worker lint type-check build dev start docker-up

install:
	npm ci
	npm --prefix frontend ci
	$(PYTHON) -m venv .venv
	.venv/bin/python -m pip install --upgrade pip
	.venv/bin/python -m pip install -r worker/requirements.txt

test: test-frontend test-worker

test-frontend:
	npm --prefix frontend run lint
	npm --prefix frontend run type-check
	npm --prefix frontend run test:unit

test-worker:
	cd worker && $(WORKER_PYTHON) -m pytest -m "not integration"

lint:
	npm --prefix frontend run lint
	cd worker && $(WORKER_PYTHON) -m ruff check .

type-check:
	npm --prefix frontend run type-check

build:
	npm --prefix frontend run build

dev:
	npm --prefix frontend run dev

start:
	npm --prefix frontend run start

docker-up:
	docker compose up --build
