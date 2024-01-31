start: 
	@docker-compose up -d

stop: 
	@docker-compose down

clean:
	@docker image prune -af

restart: stop clean start
