docker exec -e COLUMNS="`tput cols`" -e LINES="`tput lines`" -it $(docker ps -q) bash
