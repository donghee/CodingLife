#docker run -it --rm -v /home/donghee:/home/user:rw -v /tmp/.X11-unix:/tmp/.X11-unix:ro -e DISPLAY=${DISPLAY} -e LOCAL_USER_ID="$(id -u)" -e LOCAL_GROUP_ID="$(id -g)" --cap-add SYS_ADMIN --cap-add MKNOD --device /dev/fuse:mrw --name=px4-dev-simulation-bionic px4io/px4-dev-simulation-bionic /bin/bash 
#docker run -it --privileged --publish 14550:14550/udp --rm -v /home/donghee:/home/user:rw -v /tmp/.X11-unix:/tmp/.X11-unix:ro -e DISPLAY=${DISPLAY} -e LOCAL_USER_ID="$(id -u)" -e LOCAL_GROUP_ID="$(id -g)" --name=px4-dev-simulation-bionic px4io/px4-dev-simulation-bionic /bin/bash 
docker run -it --privileged --publish 14550:14550 --rm -v /home/donghee:/home/user:rw -v /tmp/.X11-unix:/tmp/.X11-unix:ro -e DISPLAY=${DISPLAY} -e LOCAL_USER_ID="$(id -u)" -e LOCAL_GROUP_ID="$(id -g)" --name=px4-dev-simulation-bionic px4io/px4-dev-simulation-bionic /bin/bash -c "$1" "$2" "$3"

#docker run -it \
    #--privileged \
    #--publish 14556:14556/udp \
    #--publish 8000:8000 \
    #--publish 9090:9090 \
    #--env="DISPLAY" \
    #--env="QT_X11_NO_MITSHM=1" \
    #--env=LOCAL_USER_ID="$(id -u)" \
    #--volume="$HOME:/home/user" \
    #--volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
    #--name=swam-indoor-flight donghee/swam-indoor-flight:latest \
    #/bin/bash -c "$1" "$2" "$3"


