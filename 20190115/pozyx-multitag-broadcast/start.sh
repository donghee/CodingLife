#!/bin/sh

tmux new-session -s "dronemap" -d -n "web"
tmux send-keys -t "dronemap:web" 'cd /home/donghee/src/CodingLife/20190114/pozyx_pos' Enter
tmux send-keys -t "dronemap:web" 'sleep 5; node server.js' Enter
#tmux send-keys -t "dronemap:network" "/usr/local/bin/mavproxy.py --master=/dev/ttyAMA0 --baudrate=921600 --out=udpbcast:$eth0_bcast:14550 --out=udpbcast:$wlan0_bcast:14550 --out=udpbcast:$tun0_bcast:14550 --mav20 --logfile /var/log/mav.tlog" Enter
#tmux send-keys -t "dronemap:network" '/usr/local/bin/mavproxy.py --master=/dev/ttyAMA0 --baudrate=921600 --out=udpbcast:255.255.255.255:14550' Enter
tmux new-window -t "dronemap" -n "pozyx"
tmux send-keys -t "dronemap:pozyx" 'cd /home/donghee/src/CodingLife/20190115/pozyx-multitag-broadcast;pipenv run start' Enter
tmux new-window -t "dronemap" -n "shell"
