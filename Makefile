.PHONY: dev build test seed migrate logs

dev:
	docker compose up

build:
	docker compose build

test:
	cd backend && pytest

seed:
	cd backend && python -c "from main import seed_demo_data; seed_demo_data()"

migrate:
	@echo "Migrations handled dynamically by SQLite."

logs:
	docker compose logs -f
