# 수업 교재

 - 교재: https://learn.dronemap.io
 - 채팅: https://discord.gg/2HkV6a

# 순서
 - [1일차](https://raw.githack.com/donghee/CodingLife/master/20180724/PX4-Dev-Workshop/kumoh/1.html) 드론 제어 소프트웨어 소개 및 설치, ROS 프로그래밍
 - [2일차](https://raw.githack.com/donghee/CodingLife/master/20180724/PX4-Dev-Workshop/kumoh/2.html) 컴퓨터 비전: OpenCV, Maker Detect, Pose Estimation
 - 3일차 드론 조립 및 비행
 - [+차수](https://raw.githack.com/donghee/CodingLife/master/20180724/PX4-Dev-Workshop/kumoh/3.html) 컴퓨터 비전 시뮬레이터 개발 환경 구성

# 드론 제어하는 ROS 프로그래밍

## 드론 제어 소프트웨어 소개 및 설치
 - PX4, 리눅스, ROS
 - ROS 설치

## ROS 프로그래밍
 - 가제보
 - 터틀심
 - ROS 기본 사용법
 - MAVROS소개

## ROS 프로그래밍 실습
 - MAVROS 노드 만들기
 - OpenCV(ROS CvBridge, aruco pos estimation)
 - Offboard 모드 연결
 - Offboard control with vision (카메라를 이용하여 드론 제어)

## 컴퓨터 비전: OpenCV, Maker Detect, Pose Estimation
 - OpenCV
 - Aruco Maker Detector
 - Pose Estimation

----

# Docker

ROS 개발을 위한  docker 환경

docker donghee/user 이미지 실행

```
docker run -it --privileged -v /dev/video0:/dev/video0 -v $HOME:/home/user:rw -v /tmp/.X11-unix:/tmp/.X11-unix:ro -e DISPLAY=${DISPLAY} --user $(id -u):$(id -g) donghee/ubuntu:bionic /bin/bash
```

기존의 docker 이미지에 접속

```
docker exec -e COLUMNS="`tput cols`" -e LINES="`tput lines`" -u $(id -u):$(id -g) -it $(docker ps -q) bash
```

docker에서 gazebo 실행시 QT XCB error 해결 https://github.com/nanocurrency/nano-node/issues/1055
```
sudo ln -sf /usr/lib/x86_64-linux-gnu/qt5/plugins/platforms/ /usr/bin/
```
