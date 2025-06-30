
# Table of Contents

1.  [Commander](#org609146b)
    1.  [Commander App](#orgbff7181)
    2.  [관련 토픽](#org4477e49)
        1.  [Commander 에서 Publish 토픽](#orgd369546)
        2.  [Commander 에서 구독하는 토픽](#org486a529)
    3.  [주요 함수](#org10c16aa)
        1.  [Commander 클래스](#orgcb67247)
    4.  [실행 순서대로 읽기](#org635123a)
        1.  [Commander::run()](#orgb8c248d)



<a id="org609146b"></a>

# Commander

PX4의 비즈니스 로직. 상태머신

Commander App은 비행 명령과 비행체 정보를 모아 수행할 명령을 결정하고, 다른 App에게 명령을 내린다.

관련 코드: <https://github.com/PX4/Firmware/tree/master/src/modules/commander>


<a id="orgbff7181"></a>

## Commander App

Commander 앱에서 하는 일. 비행에 관련된 의사 결정을 한다. 기체 상태에 관한 토픽을 읽고, 명령을 내린다.

주요 상태 및 명령

-   비행모드 전환 및 수행지시 (상태머신으로 구현)
-   파라미터 업데이트 (`parameter_update`)
-   RC입력 읽기(`manual_control_setpoint`)
-   센서값(`sensor_combined`) 읽기
-   시스템 파워 관리: 파워를 선택
-   Safety 스위치(`safety`) 체크
-   기체상태 관리(`vtol_vehicle_status`)
-   기체 위치(`vehicle_global_position`)
-   기체 로컬 위치(`vehicle_local_position`)
-   기체 자세(`vehicle_attitude`)
-   기체 착륙 여부(`vehicle_land_detected`)
-   CPU로드, 배터리 상태 체크(`cpuload`, `batterystatus`)


<a id="org4477e49"></a>

## 관련 토픽

Commander 에서 출판(Publish)하고 구독(Subscribe)하는 토픽


<a id="orgd369546"></a>

### Commander 에서 Publish 토픽

    
    armed_pub
    commander_state_pub
    homePub
    led_control_pub
    mission_pub
    command_ack_pub
    control_mode_pub
    roi_pub
    status_pub
    status_pub
    vehicle_status_flags_pub


<a id="org486a529"></a>

### Commander 에서 구독하는 토픽

다음은 Commander App에서 구독하는 토픽이다.. PX4에서 사용되는 대부분의 토픽을 구독한다.

토픽에 대한 자세한 내용은 msg 디렉토리 참고. <https://github.com/PX4/Firmware/tree/master/msg>

    
    _VEHICLE_ATTITUDE_CONTROLS
    battery_status
    cpuload
    differential_pressure
    estimator_status
    geofence_result
    manual_control_setpoint
    mission_result
    offboard_control_mode
    parameter_update
    position_setpoint_triplet
    safety
    sensor_accel
    sensor_combined
    sensor_correction
    sensor_gyro
    sensor_mag
    sensor_preflight
    subsystem_info
    system_power
    telemetry_status
    vehicle_attitude
    vehicle_command
    vehicle_global_position
    vehicle_gps_position
    vehicle_land_detected
    vehicle_local_position
    vehicle_status
    vtol_vehicle_status


<a id="org10c16aa"></a>

## 주요 함수

    int commander_main(int argc, char *argv[])

Commander App 시작 함수.
데몬의 상태 출력하거나 기체에 명령(arm, disarm, preflight check, takeoff, land, calibration, 모드전환)을 내릴 수 있다.

    void usage(const char *reason);

nsh 터미널에서 commander 명령 사용법 출력

    void control_status_leds(vehicle_status_s *status_local, const actuator_armed_s *actuator_armed, bool changed,
                 battery_status_s *battery_local, const cpuload_s *cpuload_local);

기체의 상태에 따라 상태 LED를 제어.

    void get_circuit_breaker_params();

서킷 브레이커에 관한 파라미터 값을 읽어 온다.
서킷 브레이커를 사용하면, 센서나 입력신호에 대한 체크 하지 않고, 사전비행 체크(preflight check) 또는 비행 중 체크해야하는 내용을 체크하지 않고 통과할 수 있다.

    void set_control_mode();

모드 전환. 선택한 제어모드에 따라서 관련 상태 플래그를 수정한다.

    bool stabilization_required();

현재 기체 상태를 읽어, stabilizationd이 요구되는지 체크한다.

    void print_reject_mode(const char *msg);

모드 전환시. reject(거절)하는 이유를 로그로 남기고, 소리를 낸다.

    void print_reject_arm(const char *msg);

arming 할때. reject(거절)하는 이유를 로그로 남기고, 소리를 낸다.

    void print_status();

기체의 타입, USB연결 여부, 파워 상태, 위도, 경도, 고도, 홈 위치, 데이터 링크 상태, 네베게이션 상태, 암상태 등을 알려준다.

    transition_result_t arm_disarm(bool arm, orb_advert_t *mavlink_log_pub, const char *armedBy);

arming 또는 disarm 명령을 내리고 그 결과를 리턴한다.

    void *commander_low_prio_loop(void *arg);

센서 캘리브레이션 또는 파라미터 로드와 같은 우선순위 낮은 테스크를 실행하는 루프

    static void answer_command(const vehicle_command_s &cmd, unsigned result, orb_advert_t &command_ack_pub);

기체에 명령을 내렸을때 수행 결과 여부를 알려준다.


<a id="orgcb67247"></a>

### Commander 클래스

위치: [class Commander](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/modules/commander/Commander.hpp#L69)

    Commander::main()

Commander 클래스의 메인 함수.

    Commander::handle_command()

기체에 내려진 명령(REPOSITION, SET MODE, ARM DISARM, FLIGHT TERMINATION, SET HOME, GUIDED ENABLE, RETURN TO LAND, TAKE OFF, LAND, PRECISION LAND, MISSION START )을 수행하고 그 결과를 리턴

    Commander::run()

Commander 앱의 메인 쓰레드.


<a id="org635123a"></a>

## 실행 순서대로 읽기

Commander 클래스는 ModuleBase 템플릿 클래스를 상속하여 구현한다. 그래서 Commander 클래스 실행 순서는 ModuleBase 템플릿 클래스를
참조하여 실행한다.

참고:

-   ModuleBase 클래스 `Firmware/src/platforms/px4_module.h` `Firmware/src/templates/module/module.cpp`
-   Commander 클래스 `Firmware/src/modules/commander/Commander.hpp` `Firmware/src/modules/commander/commander.cpp`

1.  [`commander_main()`](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/modules/commander/commander.cpp#L266)함수
2.  [Commander::main()](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/modules/commander/commander.cpp#L283) 실행, [ModuleBase::main()](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/platforms/px4_module.h#L117), [`ModuleBase::start_command_base()`](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/platforms/px4_module.h#L181)
3.  [`Commander::task_spawn()`](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/modules/commander/commander.cpp#L4001) 실행, [`ModuleBase::run_trampoline()`](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/platforms/px4_module.h#L152)실행
4.  [Commander::run()](https://github.com/PX4/Firmware/blob/3293fe47f9d33fa83fdac2061695f1d20a2e09fb/src/modules/commander/commander.cpp#L1157) 실행


<a id="orgb8c248d"></a>

### Commander::run()

    
    void
    Commander::run()
    {
        bool sensor_fail_tune_played = false;
        bool arm_tune_played = false;
        bool was_landed = true;
        bool was_falling = false;
        bool was_armed = false;
    
        // 센서 초기화 여부 확인 플래그
        status_flags.condition_system_sensors_initialized = true;
    
        // 파라미터 값 로드
        param_t _param_sys_type = param_find("MAV_TYPE");
        param_t _param_system_id = param_find("MAV_SYS_ID");
        param_t _param_component_id = param_find("MAV_COMP_ID");
        param_t _param_enable_datalink_loss = param_find("NAV_DLL_ACT");
        param_t _param_offboard_loss_act = param_find("COM_OBL_ACT");
        param_t _param_offboard_loss_rc_act = param_find("COM_OBL_RC_ACT");
        param_t _param_enable_rc_loss = param_find("NAV_RCL_ACT");
        param_t _param_datalink_loss_timeout = param_find("COM_DL_LOSS_T");
        param_t _param_highlatencydatalink_loss_timeout = param_find("COM_HLDL_LOSS_T");
        param_t _param_rc_loss_timeout = param_find("COM_RC_LOSS_T");
        param_t _param_datalink_regain_timeout = param_find("COM_DL_REG_T");
        param_t _param_highlatencydatalink_regain_timeout = param_find("COM_HLDL_REG_T");
        param_t _param_ef_throttle_thres = param_find("COM_EF_THROT");
        param_t _param_ef_current2throttle_thres = param_find("COM_EF_C2T");
        param_t _param_ef_time_thres = param_find("COM_EF_TIME");
        param_t _param_rc_in_off = param_find("COM_RC_IN_MODE");
        param_t _param_rc_arm_hyst = param_find("COM_RC_ARM_HYST");
        param_t _param_min_stick_change = param_find("COM_RC_STICK_OV");
        param_t _param_geofence_action = param_find("GF_ACTION");
        param_t _param_disarm_land = param_find("COM_DISARM_LAND");
        param_t _param_low_bat_act = param_find("COM_LOW_BAT_ACT");
        param_t _param_offboard_loss_timeout = param_find("COM_OF_LOSS_T");
        param_t _param_arm_without_gps = param_find("COM_ARM_WO_GPS");
        param_t _param_arm_switch_is_button = param_find("COM_ARM_SWISBTN");
        param_t _param_rc_override = param_find("COM_RC_OVERRIDE");
        param_t _param_arm_mission_required = param_find("COM_ARM_MIS_REQ");
        param_t _param_flight_uuid = param_find("COM_FLIGHT_UUID");
        param_t _param_takeoff_finished_action = param_find("COM_TAKEOFF_ACT");
    
        param_t _param_fmode_1 = param_find("COM_FLTMODE1");
        param_t _param_fmode_2 = param_find("COM_FLTMODE2");
        param_t _param_fmode_3 = param_find("COM_FLTMODE3");
        param_t _param_fmode_4 = param_find("COM_FLTMODE4");
        param_t _param_fmode_5 = param_find("COM_FLTMODE5");
        param_t _param_fmode_6 = param_find("COM_FLTMODE6");
    
        /* failsafe response to loss of navigation accuracy */
        param_t _param_posctl_nav_loss_act = param_find("COM_POSCTL_NAVL");
    
    
        // 파라미터 또는 캘리브레이션 관련 쓰레드.
        pthread_t commander_low_prio_thread;
    
        // 초기화
        if (led_init() != OK) {
            PX4_WARN("LED init failed");
        }
    
        if (buzzer_init() != OK) {
            PX4_WARN("Buzzer init failed");
        }
    
        // 파워 버튼 상태에 관한 토픽 구독
        int power_button_state_sub = orb_subscribe(ORB_ID(power_button_state));
        {
            // we need to do an initial publication to make sure uORB allocates the buffer, which cannot happen
            // in IRQ context.
            power_button_state_s button_state;
            button_state.timestamp = 0;
            button_state.event = 0xff;
            power_button_state_pub = orb_advertise(ORB_ID(power_button_state), &button_state);
            orb_copy(ORB_ID(power_button_state), power_button_state_sub, &button_state);
        }
    
        // 파워상태를 알람하는 콜백 함수 등록
        if (board_register_power_state_notification_cb(power_button_state_notification_cb) != 0) {
            PX4_ERR("Failed to register power notification callback");
        }
    
        // RC 입력 플래그 초기.
        // We want to accept RC inputs as default
        status_flags.rc_input_blocked = false;
        status.rc_input_mode = vehicle_status_s::RC_IN_MODE_DEFAULT;
        internal_state.main_state = commander_state_s::MAIN_STATE_MANUAL;
        internal_state.timestamp = hrt_absolute_time();
        status.nav_state = vehicle_status_s::NAVIGATION_STATE_MANUAL;
        status.arming_state = vehicle_status_s::ARMING_STATE_INIT;
    
        status.failsafe = false;
    
        // Offboard 신호 한번 이상 받았는지, RC신호 한번 이상 받았는지 체크 플래그
        /* neither manual nor offboard control commands have been received */
        status_flags.offboard_control_signal_found_once = false;
        status_flags.rc_signal_found_once = false;
    
        // RC, Offboard, 데이터 텔레메트리 신호 잃은적 있는지 체크 플래그
        /* mark all signals lost as long as they haven't been found */
        status.rc_signal_lost = true;
        status_flags.offboard_control_signal_lost = true;
        status.data_link_lost = true;
        status_flags.offboard_control_loss_timeout = false;
    
        status_flags.condition_system_hotplug_timeout = false;
    
        status.timestamp = hrt_absolute_time();
    
        status_flags.condition_power_input_valid = true;
        status_flags.usb_connected = false;
        status_flags.rc_calibration_valid = true;
    
        // 서킷 블레이커. 기본으로 모두 false! circuit breaker가 false가 되면 연결 여부를 체크한다.
        // power check는 power 커넥터로 부터 전원 들어오는지 체크
        // airspd check는 airspeed 센서 연결 여부 체크
        // engine failure check 는 RC 엔진 연결 여부 체크
        // gps failure check 는 gps 에러 여부 체크
        status_flags.circuit_breaker_engaged_power_check = false;
        status_flags.circuit_breaker_engaged_airspd_check = false;
        status_flags.circuit_breaker_engaged_enginefailure_check = false;
        status_flags.circuit_breaker_engaged_gpsfailure_check = false;
        get_circuit_breaker_params();
    
        // 위치, 속도가 유효한지 체크 하는 플래그.
        status_flags.condition_global_position_valid = false;
        status_flags.condition_local_position_valid = false;
        status_flags.condition_local_velocity_valid = false;
        status_flags.condition_local_altitude_valid = false;
    
        // 기체 상태 vehicle_status 관한 토픽 초기화
        status_pub = orb_advertise(ORB_ID(vehicle_status), &status);
    
        if (status_pub == nullptr) {
            warnx("ERROR: orb_advertise for topic vehicle_status failed (uorb app running?).\n");
            warnx("exiting.");
            px4_task_exit(PX4_ERROR);
        }
    
        // arming 관련된 토픽 초기화
        memset(&armed, 0, sizeof(armed));
        /* armed topic */
        orb_advert_t armed_pub = orb_advertise(ORB_ID(actuator_armed), &armed);
        hrt_abstime last_disarmed_timestamp = 0;
    
        // 기체 컨트롤 관련된 토픽 초기화
        memset(&control_mode, 0, sizeof(control_mode));
        orb_advert_t control_mode_pub = orb_advertise(ORB_ID(vehicle_control_mode), &control_mode);
    
        // 홈 위치 관련된 토픽 초기화
        orb_advert_t home_pub = nullptr;
        memset(&_home, 0, sizeof(_home));
    
        // 명령 ACK 관련된 토픽 초기화
        orb_advert_t command_ack_pub = nullptr;
        orb_advert_t commander_state_pub = nullptr;
        orb_advert_t vehicle_status_flags_pub = nullptr;
    
        // 미션 초기화
        /* init mission state, do it here to allow navigator to use stored mission even if mavlink failed to start */
        mission_init();
    
        /* Start monitoring loop */
        unsigned counter = 0;
        int stick_off_counter = 0;
        int stick_on_counter = 0;
    
        bool low_battery_voltage_actions_done = false;
        bool critical_battery_voltage_actions_done = false;
        bool emergency_battery_voltage_actions_done = false;
        bool dangerous_battery_level_requests_poweroff = false;
    
        bool status_changed = true;
        bool param_init_forced = true;
    
        bool updated = false;
    
        // safety 토픽 구독
        int safety_sub = orb_subscribe(ORB_ID(safety));
        memset(&safety, 0, sizeof(safety));
        safety.safety_switch_available = false;
        safety.safety_off = false;
    
        // geofence 결과 토픽 구독
        int geofence_result_sub = orb_subscribe(ORB_ID(geofence_result));
        struct geofence_result_s geofence_result;
        memset(&geofence_result, 0, sizeof(geofence_result));
    
        // manual control setpoint 토픽 구독. RC입력에 관한 토픽.
        int sp_man_sub = orb_subscribe(ORB_ID(manual_control_setpoint));
        memset(&sp_man, 0, sizeof(sp_man));
    
        // offboard control 토픽 구독.
        int offboard_control_mode_sub = orb_subscribe(ORB_ID(offboard_control_mode));
        memset(&offboard_control_mode, 0, sizeof(offboard_control_mode));
    
        // landing 여부 판단하는 토픽 구독
        int land_detector_sub = orb_subscribe(ORB_ID(vehicle_land_detected));
        land_detector.landed = true;
    
        // mavlink또는 rc 도는 navigator에 의해 내려진 명령을 읽을 수 있는 토픽 구독
        /* Subscribe to command topic */
        int cmd_sub = orb_subscribe(ORB_ID(vehicle_command));
    
        // 파라미터 변경 여부를 알려주는 토픽 구독
        int param_changed_sub = orb_subscribe(ORB_ID(parameter_update));
    
        // 배터리 상태 토픽 구독
        /* Subscribe to battery topic */
        int battery_sub = orb_subscribe(ORB_ID(battery_status));
        memset(&battery, 0, sizeof(battery));
    
        // GPS, RC, 텔레메트리 등의 시스템 상태에 관한 토픽 구독
        /* Subscribe to subsystem info topic */
        int subsys_sub = orb_subscribe(ORB_ID(subsystem_info));
        struct subsystem_info_s info;
        memset(&info, 0, sizeof(info));
    
        // 시스템 파워(USB, Battery, Servo Rail) 에 관한 토픽 구독
        int system_power_sub = orb_subscribe(ORB_ID(system_power));
    
        // 모터 제어 정보에 관한 토픽 구독
        int actuator_controls_sub = orb_subscribe(ORB_ID_VEHICLE_ATTITUDE_CONTROLS);
    
        /* Subscribe to vtol vehicle status topic */
        int vtol_vehicle_status_sub = orb_subscribe(ORB_ID(vtol_vehicle_status));
        //struct vtol_vehicle_status_s vtol_status;
        memset(&vtol_status, 0, sizeof(vtol_status));
        vtol_status.vtol_in_rw_mode = true;     //default for vtol is rotary wing
    
        // Estimator 상태 정보 구독
        int estimator_status_sub = orb_subscribe(ORB_ID(estimator_status));
        struct estimator_status_s estimator_status;
    
        // 이륙 후 navigator failure 상태 체크
        /* class variables used to check for navigation failure after takeoff */
        hrt_abstime time_at_takeoff = 0; // last time we were on the ground
        hrt_abstime time_last_innov_pass = 0; // last time velocity innovations passed
        bool nav_test_passed = false; // true if the post takeoff navigation test has passed
        bool nav_test_failed = false; // true if the post takeoff navigation test has failed
    
        int cpuload_sub = orb_subscribe(ORB_ID(cpuload));
        memset(&cpuload, 0, sizeof(cpuload));
    
        control_status_leds(&status, &armed, true, &battery, &cpuload);
    
        thread_running = true;
    
        /* update vehicle status to find out vehicle type (required for preflight checks) */
        int32_t system_type;
        param_get(_param_sys_type, &system_type); // get system type
        status.system_type = (uint8_t)system_type;
        status.is_rotary_wing = is_rotary_wing(&status) || is_vtol(&status);
        status.is_vtol = is_vtol(&status);
    
        commander_boot_timestamp = hrt_absolute_time();
    
        // initially set to failed
        _last_lpos_fail_time_us = commander_boot_timestamp;
        _last_gpos_fail_time_us = commander_boot_timestamp;
        _last_lvel_fail_time_us = commander_boot_timestamp;
    
        // 사전 비행 체크
        int32_t rc_in_off = 0;
    
        param_get(_param_rc_in_off, &rc_in_off);
    
        int32_t arm_switch_is_button = 0;
        param_get(_param_arm_switch_is_button, &arm_switch_is_button);
    
        int32_t arm_without_gps_param = 0;
        param_get(_param_arm_without_gps, &arm_without_gps_param);
        arm_requirements = (arm_without_gps_param == 1) ? ARM_REQ_NONE : ARM_REQ_GPS_BIT;
    
        int32_t arm_mission_required_param = 0;
        param_get(_param_arm_mission_required, &arm_mission_required_param);
        arm_requirements |= (arm_mission_required_param & (ARM_REQ_MISSION_BIT | ARM_REQ_ARM_AUTH_BIT));
    
        status.rc_input_mode = rc_in_off;
    
        // user adjustable duration required to assert arm/disarm via throttle/rudder stick
        int32_t rc_arm_hyst = 100;
        param_get(_param_rc_arm_hyst, &rc_arm_hyst);
        rc_arm_hyst *= COMMANDER_MONITORING_LOOPSPERMSEC;
    
        int32_t datalink_loss_act = 0;
        int32_t rc_loss_act = 0;
        int32_t datalink_loss_timeout = 10;
        int32_t highlatencydatalink_loss_timeout = 120;
        float rc_loss_timeout = 0.5;
        int32_t datalink_regain_timeout = 0;
        int32_t highlatencydatalink_regain_timeout = 0;
        float offboard_loss_timeout = 0.0f;
        int32_t offboard_loss_act = 0;
        int32_t offboard_loss_rc_act = 0;
        int32_t posctl_nav_loss_act = 0;
    
        int32_t geofence_action = 0;
    
        int32_t flight_uuid = 0;
    
        // AUTO MODE(MISSION, HOLD 모드)에서 RC 스틱이 들어왔을때 이전 모드(position mode)로 돌아가는지 결정
        // rc_override 가 0 이면, AUTO MODE에서 RC 스틱 입력이 들어와도 계속 AUTO MODE를 유지한다.
        /* RC override auto modes */
        int32_t rc_override = 0;
    
        int32_t takeoff_complete_act = 0;
    
        /* Thresholds for engine failure detection */
        float ef_throttle_thres = 1.0f;
        float ef_current2throttle_thres = 0.0f;
        float ef_time_thres = 1000.0f;
        uint64_t timestamp_engine_healthy = 0; /**< absolute time when engine was healty */
    
        int32_t disarm_when_landed = 0;
        int32_t low_bat_action = 0;
    
        // commander의 상태머신 변경여부 플래그
        /* check which state machines for changes, clear "changed" flag */
        bool main_state_changed = false;
        bool failsafe_old = false;
    
        bool have_taken_off_since_arming = false;
    
        // 사전 비행 체크, 캘리브레이션 관련된 테스크 초기화
        pthread_attr_t commander_low_prio_attr;
        pthread_attr_init(&commander_low_prio_attr);
        pthread_attr_setstacksize(&commander_low_prio_attr, PX4_STACK_ADJUSTED(3000));
    
    #ifndef __PX4_QURT
        // This is not supported by QURT (yet).
        struct sched_param param;
        (void)pthread_attr_getschedparam(&commander_low_prio_attr, &param);
    
        /* low priority */
        param.sched_priority = SCHED_PRIORITY_DEFAULT - 50;
        (void)pthread_attr_setschedparam(&commander_low_prio_attr, &param);
    #endif
    
        pthread_create(&commander_low_prio_thread, &commander_low_prio_attr, commander_low_prio_loop, nullptr);
        pthread_attr_destroy(&commander_low_prio_attr);
    
        arm_auth_init(&mavlink_log_pub, &status.system_id);
    
        while (!should_exit()) {
    
            transition_result_t arming_ret = TRANSITION_NOT_CHANGED;
    
            // 파라미터 업데이트
            bool params_updated = false;
            orb_check(param_changed_sub, &params_updated);
    
            if (params_updated || param_init_forced) {
    
                // 파라미터 변경 여부 체크
                struct parameter_update_s param_changed;
                orb_copy(ORB_ID(parameter_update), param_changed_sub, &param_changed);
    
                updateParams();
    
                // 파라미터 업데이트
                if (!armed.armed) {
                    if (param_get(_param_sys_type, &system_type) != OK) {
                        PX4_ERR("failed getting new system type");
    
                    } else {
                        status.system_type = (uint8_t)system_type;
                    }
    
                    /* disable manual override for all systems that rely on electronic stabilization */
                    if (is_rotary_wing(&status) || (is_vtol(&status) && vtol_status.vtol_in_rw_mode)) {
                        status.is_rotary_wing = true;
    
                    } else {
                        status.is_rotary_wing = false;
                    }
    
                    /* set vehicle_status.is_vtol flag */
                    status.is_vtol = is_vtol(&status);
    
                    /* check and update system / component ID */
                    int32_t sys_id = 0;
                    param_get(_param_system_id, &sys_id);
                    status.system_id = sys_id;
    
                    int32_t comp_id = 0;
                    param_get(_param_component_id, &comp_id);
                    status.component_id = comp_id;
    
                    get_circuit_breaker_params();
    
                    status_changed = true;
                }
    
                // 위험(safety) 관련 파라미터 값 로드
                param_get(_param_enable_datalink_loss, &datalink_loss_act);
                param_get(_param_enable_rc_loss, &rc_loss_act);
                param_get(_param_datalink_loss_timeout, &datalink_loss_timeout);
                param_get(_param_highlatencydatalink_loss_timeout, &highlatencydatalink_loss_timeout);
                param_get(_param_rc_loss_timeout, &rc_loss_timeout);
                param_get(_param_rc_in_off, &rc_in_off);
                status.rc_input_mode = rc_in_off;
                param_get(_param_rc_arm_hyst, &rc_arm_hyst);
                param_get(_param_min_stick_change, &min_stick_change);
                param_get(_param_rc_override, &rc_override);
                // percentage (* 0.01) needs to be doubled because RC total interval is 2, not 1
                min_stick_change *= 0.02f;
                rc_arm_hyst *= COMMANDER_MONITORING_LOOPSPERMSEC;
                param_get(_param_datalink_regain_timeout, &datalink_regain_timeout);
                param_get(_param_highlatencydatalink_regain_timeout, &highlatencydatalink_regain_timeout);
                param_get(_param_ef_throttle_thres, &ef_throttle_thres);
                param_get(_param_ef_current2throttle_thres, &ef_current2throttle_thres);
                param_get(_param_ef_time_thres, &ef_time_thres);
                param_get(_param_geofence_action, &geofence_action);
                param_get(_param_disarm_land, &disarm_when_landed);
                param_get(_param_flight_uuid, &flight_uuid);
    
                // If we update parameters the first time
                // make sure the hysteresis time gets set.
                // After that it will be set in the main state
                // machine based on the arming state.
                if (param_init_forced) {
                    auto_disarm_hysteresis.set_hysteresis_time_from(false, disarm_when_landed * 1_s);
                }
    
                param_get(_param_low_bat_act, &low_bat_action);
                param_get(_param_offboard_loss_timeout, &offboard_loss_timeout);
                param_get(_param_offboard_loss_act, &offboard_loss_act);
                param_get(_param_offboard_loss_rc_act, &offboard_loss_rc_act);
                param_get(_param_arm_switch_is_button, &arm_switch_is_button);
    
                param_get(_param_arm_without_gps, &arm_without_gps_param);
                arm_requirements = (arm_without_gps_param == 1) ? ARM_REQ_NONE : ARM_REQ_GPS_BIT;
                param_get(_param_arm_mission_required, &arm_mission_required_param);
                arm_requirements |= (arm_mission_required_param & (ARM_REQ_MISSION_BIT | ARM_REQ_ARM_AUTH_BIT));
    
                /* flight mode slots */
                param_get(_param_fmode_1, &_flight_mode_slots[0]);
                param_get(_param_fmode_2, &_flight_mode_slots[1]);
                param_get(_param_fmode_3, &_flight_mode_slots[2]);
                param_get(_param_fmode_4, &_flight_mode_slots[3]);
                param_get(_param_fmode_5, &_flight_mode_slots[4]);
                param_get(_param_fmode_6, &_flight_mode_slots[5]);
    
                /* failsafe response to loss of navigation accuracy */
                param_get(_param_posctl_nav_loss_act, &posctl_nav_loss_act);
    
                param_get(_param_takeoff_finished_action, &takeoff_complete_act);
    
                param_init_forced = false;
            }
    
            // 파워 버튼 토픽 변경 여부 체크
            orb_check(power_button_state_sub, &updated);
    
            if (updated) {
                power_button_state_s button_state;
                orb_copy(ORB_ID(power_button_state), power_button_state_sub, &button_state);
    
                if (button_state.event == power_button_state_s::PWR_BUTTON_STATE_REQUEST_SHUTDOWN) {
                    px4_shutdown_request(false, false);
                }
            }
    
            //  RC(manual control setpoint) 변경 여부 체크
            orb_check(sp_man_sub, &updated);
    
            if (updated) {
                orb_copy(ORB_ID(manual_control_setpoint), sp_man_sub, &sp_man);
            }
            // Offboard 제어 모드 인지 체크
            orb_check(offboard_control_mode_sub, &updated);
    
            if (updated) {
                orb_copy(ORB_ID(offboard_control_mode), offboard_control_mode_sub, &offboard_control_mode);
            }
    
            if (offboard_control_mode.timestamp != 0 &&
                offboard_control_mode.timestamp + OFFBOARD_TIMEOUT > hrt_absolute_time()) {
                if (status_flags.offboard_control_signal_lost) {
                    status_flags.offboard_control_signal_lost = false;
                    status_flags.offboard_control_loss_timeout = false;
                    status_changed = true;
                }
    
            } else {
                if (!status_flags.offboard_control_signal_lost) {
                    status_flags.offboard_control_signal_lost = true;
                    status_changed = true;
                }
    
                /* check timer if offboard was there but now lost */
                if (!status_flags.offboard_control_loss_timeout && offboard_control_mode.timestamp != 0) {
                    if (offboard_loss_timeout < FLT_EPSILON) {
                        /* execute loss action immediately */
                        status_flags.offboard_control_loss_timeout = true;
    
                    } else {
                        /* wait for timeout if set */
                        status_flags.offboard_control_loss_timeout = offboard_control_mode.timestamp +
                                OFFBOARD_TIMEOUT + offboard_loss_timeout * 1e6f < hrt_absolute_time();
                    }
    
                    if (status_flags.offboard_control_loss_timeout) {
                        status_changed = true;
                    }
                }
            }
    
            // 텔레메트리 상태 루프.
            poll_telemetry_status();
    
            orb_check(system_power_sub, &updated);
    
            if (updated) {
                system_power_s system_power = {};
                orb_copy(ORB_ID(system_power), system_power_sub, &system_power);
    
                if (hrt_elapsed_time(&system_power.timestamp) < 200_ms) {
                    if (system_power.servo_valid &&
                        !system_power.brick_valid &&
                        !system_power.usb_connected) {
                        /* flying only on servo rail, this is unsafe */
                        status_flags.condition_power_input_valid = false;
    
                    } else {
                        status_flags.condition_power_input_valid = true;
                    }
    
                    /* if the USB hardware connection went away, reboot */
                    if (status_flags.usb_connected && !system_power.usb_connected) {
                        /*
                         * apparently the USB cable went away but we are still powered,
                         * so lets reset to a classic non-usb state.
                         */
                        mavlink_log_critical(&mavlink_log_pub, "USB disconnected, rebooting.")
                        usleep(400000);
                        px4_shutdown_request(true, false);
                    }
                }
            }
    
            // safety 토픽 변경 여부 체크
            orb_check(safety_sub, &updated);
    
            if (updated) {
                bool previous_safety_off = safety.safety_off;
    
                if (orb_copy(ORB_ID(safety), safety_sub, &safety) == PX4_OK) {
    
                    /* disarm if safety is now on and still armed */
                    if (armed.armed && (status.hil_state == vehicle_status_s::HIL_STATE_OFF)
                        && safety.safety_switch_available && !safety.safety_off) {
    
                        if (TRANSITION_CHANGED == arming_state_transition(&status, battery, safety, vehicle_status_s::ARMING_STATE_STANDBY,
                                &armed, true /* fRunPreArmChecks */, &mavlink_log_pub,
                                &status_flags, arm_requirements, hrt_elapsed_time(&commander_boot_timestamp))
                           ) {
                            status_changed = true;
                        }
                    }
    
                    // Notify the user if the status of the safety switch changes
                    if (safety.safety_switch_available && previous_safety_off != safety.safety_off) {
    
                        if (safety.safety_off) {
                            set_tune(TONE_NOTIFY_POSITIVE_TUNE);
    
                        } else {
                            tune_neutral(true);
                        }
    
                        status_changed = true;
                    }
                }
            }
    
            // VTOL 기체 상태 변경 있는지 체크
            orb_check(vtol_vehicle_status_sub, &updated);
    
            if (updated) {
                /* vtol status changed */
                orb_copy(ORB_ID(vtol_vehicle_status), vtol_vehicle_status_sub, &vtol_status);
                status.vtol_fw_permanent_stab = vtol_status.fw_permanent_stab;
    
                /* Make sure that this is only adjusted if vehicle really is of type vtol */
                if (is_vtol(&status)) {
    
                    // Check if there has been any change while updating the flags
                    if (status.is_rotary_wing != vtol_status.vtol_in_rw_mode) {
                        status.is_rotary_wing = vtol_status.vtol_in_rw_mode;
                        status_changed = true;
                    }
    
                    if (status.in_transition_mode != vtol_status.vtol_in_trans_mode) {
                        status.in_transition_mode = vtol_status.vtol_in_trans_mode;
                        status_changed = true;
                    }
    
                    if (status.in_transition_to_fw != vtol_status.in_transition_to_fw) {
                        status.in_transition_to_fw = vtol_status.in_transition_to_fw;
                        status_changed = true;
                    }
    
                    if (status_flags.vtol_transition_failure != vtol_status.vtol_transition_failsafe) {
                        status_flags.vtol_transition_failure = vtol_status.vtol_transition_failsafe;
                        status_changed = true;
                    }
    
                    if (armed.soft_stop != !status.is_rotary_wing) {
                        armed.soft_stop = !status.is_rotary_wing;
                        status_changed = true;
                    }
                }
            }
    
            // 로컬 위치, 글로벌 위치(GPS)  변경 여부 체크하고, 변경되어 있으면 업데이트
            _local_position_sub.update();
            _global_position_sub.update();
    
            // Set the allowable positon uncertainty based on combination of flight and estimator state
            // When we are in a operator demanded position control mode and are solely reliant on optical flow, do not check position error becasue it will gradually increase throughout flight and the operator will compensate for the drift
            bool reliant_on_opt_flow = ((estimator_status.control_mode_flags & (1 << estimator_status_s::CS_OPT_FLOW))
                            && !(estimator_status.control_mode_flags & (1 << estimator_status_s::CS_GPS))
                            && !(estimator_status.control_mode_flags & (1 << estimator_status_s::CS_EV_POS)));
            bool operator_controlled_position = (internal_state.main_state == commander_state_s::MAIN_STATE_POSCTL);
            _skip_pos_accuracy_check = reliant_on_opt_flow && operator_controlled_position;
            if (_skip_pos_accuracy_check) {
                _eph_threshold_adj = INFINITY;
            } else {
                _eph_threshold_adj = _eph_threshold.get();
            }
    
            // Check if quality checking of position accuracy and consistency is to be performed
            const bool run_quality_checks = !status_flags.circuit_breaker_engaged_posfailure_check;
    
            /* Check estimator status for signs of bad yaw induced post takeoff navigation failure
             * for a short time interval after takeoff. Fixed wing vehicles can recover using GPS heading,
             * but rotary wing vehicles cannot so the position and velocity validity needs to be latched
             * to false after failure to prevent flyaway crashes */
            if (run_quality_checks && status.is_rotary_wing) {
                bool estimator_status_updated = false;
                orb_check(estimator_status_sub, &estimator_status_updated);
    
                if (estimator_status_updated) {
                    orb_copy(ORB_ID(estimator_status), estimator_status_sub, &estimator_status);
    
                    if (status.arming_state == vehicle_status_s::ARMING_STATE_STANDBY) {
                        // reset flags and timer
                        time_at_takeoff = hrt_absolute_time();
                        nav_test_failed = false;
                        nav_test_passed = false;
    
                    } else if (land_detector.landed) {
                        // record time of takeoff
                        time_at_takeoff = hrt_absolute_time();
    
                    } else {
                        // if nav status is unconfirmed, confirm yaw angle as passed after 30 seconds or achieving 5 m/s of speed
                        const bool sufficient_time = (hrt_elapsed_time(&time_at_takeoff) > 30_s);
    
                        const vehicle_local_position_s &lpos = _local_position_sub.get();
                        const bool sufficient_speed = (lpos.vx * lpos.vx + lpos.vy * lpos.vy > 25.0f);
    
                        bool innovation_pass = estimator_status.vel_test_ratio < 1.0f && estimator_status.pos_test_ratio < 1.0f;
    
                        if (!nav_test_failed) {
                            if (!nav_test_passed) {
                                // pass if sufficient time or speed
                                if (sufficient_time || sufficient_speed) {
                                    nav_test_passed = true;
                                }
    
                                // record the last time the innovation check passed
                                if (innovation_pass) {
                                    time_last_innov_pass = hrt_absolute_time();
                                }
    
                                // if the innovation test has failed continuously, declare the nav as failed
                                if (hrt_elapsed_time(&time_last_innov_pass) > 1_s) {
                                    nav_test_failed = true;
                                    mavlink_log_emergency(&mavlink_log_pub, "CRITICAL NAVIGATION FAILURE - CHECK SENSOR CALIBRATION");
                                }
                            }
                        }
                    }
                }
            }
    
            // 글로벌 위치 정확도 체크
            /* run global position accuracy checks */
            // Check if quality checking of position accuracy and consistency is to be performed
            if (run_quality_checks) {
                if (nav_test_failed) {
                    status_flags.condition_global_position_valid = false;
                    status_flags.condition_local_position_valid = false;
                    status_flags.condition_local_velocity_valid = false;
    
                } else {
                    if (!_skip_pos_accuracy_check) {
                        // use global position message to determine validity
                        const vehicle_global_position_s&global_position = _global_position_sub.get();
                        check_posvel_validity(true, global_position.eph, _eph_threshold_adj, global_position.timestamp, &_last_gpos_fail_time_us, &_gpos_probation_time_us, &status_flags.condition_global_position_valid, &status_changed);
                    }
    
                    // use local position message to determine validity
                    const vehicle_local_position_s &local_position = _local_position_sub.get();
                    check_posvel_validity(local_position.xy_valid, local_position.eph, _eph_threshold_adj, local_position.timestamp, &_last_lpos_fail_time_us, &_lpos_probation_time_us, &status_flags.condition_local_position_valid, &status_changed);
                    check_posvel_validity(local_position.v_xy_valid, local_position.evh, _evh_threshold.get(), local_position.timestamp, &_last_lvel_fail_time_us, &_lvel_probation_time_us, &status_flags.condition_local_velocity_valid, &status_changed);
                }
            }
    
            if((_last_condition_global_position_valid != status_flags.condition_global_position_valid) && status_flags.condition_global_position_valid) {
                // If global position state changed and is now valid, set respective health flags to true. For now also assume GPS is OK if global pos is OK, but not vice versa.
                set_health_flags_healthy(subsystem_info_s::SUBSYSTEM_TYPE_AHRS, true, status);
                set_health_flags_present_healthy(subsystem_info_s::SUBSYSTEM_TYPE_GPS, true, true, status);
            }
    
            check_valid(_local_position_sub.get().timestamp, _failsafe_pos_delay.get() * 1_s, _local_position_sub.get().z_valid, &(status_flags.condition_local_altitude_valid), &status_changed);
    
            // 착륙 여부 판단 토픽 변경여부 체크
            orb_check(land_detector_sub, &updated);
    
            if (updated) {
                orb_copy(ORB_ID(vehicle_land_detected), land_detector_sub, &land_detector);
    
                // Only take actions if armed
                if (armed.armed) {
                    if (was_landed != land_detector.landed) {
                        if (land_detector.landed) {
                            mavlink_and_console_log_info(&mavlink_log_pub, "Landing detected");
    
                        } else {
                            mavlink_and_console_log_info(&mavlink_log_pub, "Takeoff detected");
                            have_taken_off_since_arming = true;
    
                            // Set all position and velocity test probation durations to takeoff value
                            // This is a larger value to give the vehicle time to complete a failsafe landing
                            // if faulty sensors cause loss of navigation shortly after takeoff.
                            _gpos_probation_time_us = _failsafe_pos_probation.get() * 1_s;
                            _lpos_probation_time_us = _failsafe_pos_probation.get() * 1_s;
                            _lvel_probation_time_us = _failsafe_pos_probation.get() * 1_s;
                        }
                    }
    
                    if (was_falling != land_detector.freefall) {
                        if (land_detector.freefall) {
                            mavlink_and_console_log_info(&mavlink_log_pub, "Freefall detected");
                        }
                    }
                }
    
                was_landed = land_detector.landed;
                was_falling = land_detector.freefall;
            }
    
            /* Update hysteresis time. Use a time of factor 5 longer if we have not taken off yet. */
            hrt_abstime timeout_time = disarm_when_landed * 1_s;
    
            if (!have_taken_off_since_arming) {
                timeout_time *= 5;
            }
    
            auto_disarm_hysteresis.set_hysteresis_time_from(false, timeout_time);
    
            // Check for auto-disarm
            if (armed.armed && land_detector.landed && disarm_when_landed > 0) {
                auto_disarm_hysteresis.set_state_and_update(true);
    
            } else {
                auto_disarm_hysteresis.set_state_and_update(false);
            }
    
            if (auto_disarm_hysteresis.get_state()) {
                arm_disarm(false, &mavlink_log_pub, "auto disarm on land");
            }
    
            if (!warning_action_on) {
                // store the last good main_state when not in an navigation
                // hold state
                main_state_before_rtl = internal_state.main_state;
    
            } else if (internal_state.main_state != commander_state_s::MAIN_STATE_AUTO_RTL
                   && internal_state.main_state != commander_state_s::MAIN_STATE_AUTO_LOITER
                   && internal_state.main_state != commander_state_s::MAIN_STATE_AUTO_LAND) {
                // reset flag again when we switched out of it
                warning_action_on = false;
            }
    
            orb_check(cpuload_sub, &updated);
    
            if (updated) {
                orb_copy(ORB_ID(cpuload), cpuload_sub, &cpuload);
            }
    
            // 배터리 상태 토픽 변경 여부 체크
            orb_check(battery_sub, &updated);
    
            if (updated) {
                orb_copy(ORB_ID(battery_status), battery_sub, &battery);
    
                /* only consider battery voltage if system has been running 6s (usb most likely detected) and battery voltage is valid */
                if ((hrt_elapsed_time(&commander_boot_timestamp) > 6_s)
                    && battery.voltage_filtered_v > 2.0f * FLT_EPSILON) {
    
                    /* if battery voltage is getting lower, warn using buzzer, etc. */
                    if (battery.warning == battery_status_s::BATTERY_WARNING_LOW &&
                        !low_battery_voltage_actions_done) {
    
                        low_battery_voltage_actions_done = true;
    
                        if (armed.armed) {
                            mavlink_log_critical(&mavlink_log_pub, "LOW BATTERY, RETURN TO LAND ADVISED");
    
                        } else {
                            mavlink_log_critical(&mavlink_log_pub, "LOW BATTERY, TAKEOFF DISCOURAGED");
                        }
    
                        status_changed = true;
    
                    } else if (battery.warning == battery_status_s::BATTERY_WARNING_CRITICAL &&
                           !critical_battery_voltage_actions_done) {
    
                        critical_battery_voltage_actions_done = true;
    
                        if (!armed.armed) {
                            mavlink_log_critical(&mavlink_log_pub, "CRITICAL BATTERY, SHUT SYSTEM DOWN");
    
                        } else {
                            if (low_bat_action == 1 || low_bat_action == 3) {
                                // let us send the critical message even if already in RTL
                                if (TRANSITION_DENIED != main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_RTL, status_flags, &internal_state)) {
                                    warning_action_on = true;
                                    mavlink_log_emergency(&mavlink_log_pub, "CRITICAL BATTERY, RETURNING TO LAND");
    
                                } else {
                                    mavlink_log_emergency(&mavlink_log_pub, "CRITICAL BATTERY, RTL FAILED");
                                }
    
                            } else if (low_bat_action == 2) {
                                if (TRANSITION_DENIED != main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_LAND, status_flags, &internal_state)) {
                                    warning_action_on = true;
                                    mavlink_log_emergency(&mavlink_log_pub, "CRITICAL BATTERY, LANDING AT CURRENT POSITION");
    
                                } else {
                                    mavlink_log_emergency(&mavlink_log_pub, "CRITICAL BATTERY, LANDING FAILED");
                                }
    
                            } else {
                                mavlink_log_emergency(&mavlink_log_pub, "CRITICAL BATTERY, RETURN TO LAUNCH ADVISED!");
                            }
                        }
    
                        status_changed = true;
    
                    } else if (battery.warning == battery_status_s::BATTERY_WARNING_EMERGENCY &&
                           !emergency_battery_voltage_actions_done) {
    
                        emergency_battery_voltage_actions_done = true;
    
                        if (!armed.armed) {
                            // Request shutdown at the end of the cycle. This allows
                            // the vehicle state to be published after emergency landing
                            dangerous_battery_level_requests_poweroff = true;
                        } else {
                            if (low_bat_action == 2 || low_bat_action == 3) {
                                if (TRANSITION_CHANGED == main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_LAND, status_flags, &internal_state)) {
                                    warning_action_on = true;
                                    mavlink_log_emergency(&mavlink_log_pub, "DANGEROUS BATTERY LEVEL, LANDING IMMEDIATELY");
    
                                } else {
                                    mavlink_log_emergency(&mavlink_log_pub, "DANGEROUS BATTERY LEVEL, LANDING FAILED");
                                }
    
                            } else {
                                mavlink_log_emergency(&mavlink_log_pub, "DANGEROUS BATTERY LEVEL, LANDING ADVISED!");
                            }
                        }
    
                        status_changed = true;
                    }
    
                    /* End battery voltage check */
                }
            }
    
            /* update subsystem info which arrives from outside of commander*/
            do {
                orb_check(subsys_sub, &updated);
                if (updated) {
                    orb_copy(ORB_ID(subsystem_info), subsys_sub, &info);
                    set_health_flags(info.subsystem_type, info.present, info.enabled, info.ok, status);
                    status_changed = true;
                }
            } while(updated);
    
            /* If in INIT state, try to proceed to STANDBY state */
            if (!status_flags.condition_calibration_enabled && status.arming_state == vehicle_status_s::ARMING_STATE_INIT) {
    
                arming_ret = arming_state_transition(&status, battery, safety, vehicle_status_s::ARMING_STATE_STANDBY, &armed,
                                     true /* fRunPreArmChecks */, &mavlink_log_pub, &status_flags,
                                     arm_requirements, hrt_elapsed_time(&commander_boot_timestamp));
    
                if (arming_ret == TRANSITION_DENIED) {
                    /* do not complain if not allowed into standby */
                    arming_ret = TRANSITION_NOT_CHANGED;
                }
            }
    
            // 미션 결과 체크
            const auto prev_mission_instance_count = _mission_result_sub.get().instance_count;
    
            if (_mission_result_sub.update()) {
                const mission_result_s &mission_result = _mission_result_sub.get();
    
                // if mission_result is valid for the current mission
                const bool mission_result_ok = (mission_result.timestamp > commander_boot_timestamp) && (mission_result.instance_count > 0);
    
                status_flags.condition_auto_mission_available = mission_result_ok && mission_result.valid;
    
                if (mission_result_ok) {
    
                    if (status.mission_failure != mission_result.failure) {
                        status.mission_failure = mission_result.failure;
                        status_changed = true;
    
                        if (status.mission_failure) {
                            mavlink_log_critical(&mavlink_log_pub, "Mission cannot be completed");
                        }
                    }
    
                    /* Only evaluate mission state if home is set */
                    if (status_flags.condition_home_position_valid &&
                        (prev_mission_instance_count != mission_result.instance_count)) {
    
                        if (!status_flags.condition_auto_mission_available) {
                            /* the mission is invalid */
                            tune_mission_fail(true);
    
                        } else if (mission_result.warning) {
                            /* the mission has a warning */
                            tune_mission_fail(true);
    
                        } else {
                            /* the mission is valid */
                            tune_mission_ok(true);
                        }
                    }
                }
            }
    
            // 지오펜스 결과 여부 체크
            orb_check(geofence_result_sub, &updated);
    
            if (updated) {
                orb_copy(ORB_ID(geofence_result), geofence_result_sub, &geofence_result);
            }
    
            // 지오펜스가 있으면 지오펜스 벗어났는지 체크하고, 비행 명령 수행
            // Geofence actions
            if (armed.armed && (geofence_result.geofence_action != geofence_result_s::GF_ACTION_NONE)) {
    
                static bool geofence_loiter_on = false;
                static bool geofence_rtl_on = false;
    
                // check for geofence violation
                if (geofence_result.geofence_violated) {
                    static hrt_abstime last_geofence_violation = 0;
                    const hrt_abstime geofence_violation_action_interval = 10_s;
    
                    if (hrt_elapsed_time(&last_geofence_violation) > geofence_violation_action_interval) {
    
                        last_geofence_violation = hrt_absolute_time();
    
                        switch (geofence_result.geofence_action) {
                            case (geofence_result_s::GF_ACTION_NONE) : {
                                // do nothing
                                break;
                            }
                            case (geofence_result_s::GF_ACTION_WARN) : {
                                // do nothing, mavlink critical messages are sent by navigator
                                break;
                            }
                            case (geofence_result_s::GF_ACTION_LOITER) : {
                                if (TRANSITION_CHANGED == main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_LOITER, status_flags, &internal_state)) {
                                    geofence_loiter_on = true;
                                }
    
                                break;
                            }
                            case (geofence_result_s::GF_ACTION_RTL) : {
                                if (TRANSITION_CHANGED == main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_RTL, status_flags, &internal_state)) {
                                    geofence_rtl_on = true;
                                }
    
                                break;
                            }
                            case (geofence_result_s::GF_ACTION_TERMINATE) : {
                                warnx("Flight termination because of geofence");
                                mavlink_log_critical(&mavlink_log_pub, "Geofence violation: flight termination");
                                armed.force_failsafe = true;
                                status_changed = true;
                                break;
                            }
                        }
                    }
                }
    
                // reset if no longer in LOITER or if manually switched to LOITER
                geofence_loiter_on = geofence_loiter_on
                             && (internal_state.main_state == commander_state_s::MAIN_STATE_AUTO_LOITER)
                             && (sp_man.loiter_switch == manual_control_setpoint_s::SWITCH_POS_OFF
                             || sp_man.loiter_switch == manual_control_setpoint_s::SWITCH_POS_NONE);
    
                // reset if no longer in RTL or if manually switched to RTL
                geofence_rtl_on = geofence_rtl_on
                          && (internal_state.main_state == commander_state_s::MAIN_STATE_AUTO_RTL)
                          && (sp_man.return_switch == manual_control_setpoint_s::SWITCH_POS_OFF
                              || sp_man.return_switch == manual_control_setpoint_s::SWITCH_POS_NONE);
    
                warning_action_on = warning_action_on || (geofence_loiter_on || geofence_rtl_on);
            }
    
            // revert geofence failsafe transition if sticks are moved and we were previously in a manual mode
            // but only if not in a low battery handling action
            if (rc_override != 0 && !critical_battery_voltage_actions_done && (warning_action_on &&
                    (main_state_before_rtl == commander_state_s::MAIN_STATE_MANUAL ||
                     main_state_before_rtl == commander_state_s::MAIN_STATE_ALTCTL ||
                     main_state_before_rtl == commander_state_s::MAIN_STATE_POSCTL ||
                     main_state_before_rtl == commander_state_s::MAIN_STATE_ACRO ||
                     main_state_before_rtl == commander_state_s::MAIN_STATE_RATTITUDE ||
                     main_state_before_rtl == commander_state_s::MAIN_STATE_STAB))) {
    
                // transition to previous state if sticks are touched
                if ((_last_sp_man.timestamp != sp_man.timestamp) &&
                    ((fabsf(sp_man.x - _last_sp_man.x) > min_stick_change) ||
                     (fabsf(sp_man.y - _last_sp_man.y) > min_stick_change) ||
                     (fabsf(sp_man.z - _last_sp_man.z) > min_stick_change) ||
                     (fabsf(sp_man.r - _last_sp_man.r) > min_stick_change))) {
    
                    // revert to position control in any case
                    main_state_transition(status, commander_state_s::MAIN_STATE_POSCTL, status_flags, &internal_state);
                    mavlink_log_critical(&mavlink_log_pub, "Autopilot off, returned control to pilot");
                }
            }
    
            // abort landing or auto or loiter if sticks are moved significantly
            // but only if not in a low battery handling action
            if (rc_override != 0 && !critical_battery_voltage_actions_done &&
                (internal_state.main_state == commander_state_s::MAIN_STATE_AUTO_LAND ||
                 internal_state.main_state == commander_state_s::MAIN_STATE_AUTO_MISSION ||
                 internal_state.main_state == commander_state_s::MAIN_STATE_AUTO_LOITER)) {
                // transition to previous state if sticks are touched
    
                if ((_last_sp_man.timestamp != sp_man.timestamp) &&
                    ((fabsf(sp_man.x - _last_sp_man.x) > min_stick_change) ||
                     (fabsf(sp_man.y - _last_sp_man.y) > min_stick_change) ||
                     (fabsf(sp_man.z - _last_sp_man.z) > min_stick_change) ||
                     (fabsf(sp_man.r - _last_sp_man.r) > min_stick_change))) {
    
                    // revert to position control in any case
                    main_state_transition(status, commander_state_s::MAIN_STATE_POSCTL, status_flags, &internal_state);
                    mavlink_log_critical(&mavlink_log_pub, "Autopilot off, returned control to pilot");
                }
            }
    
            // 미션 비행 끝
            /* Check for mission flight termination */
            if (armed.armed && _mission_result_sub.get().flight_termination &&
                !status_flags.circuit_breaker_flight_termination_disabled) {
    
                armed.force_failsafe = true;
                status_changed = true;
                static bool flight_termination_printed = false;
    
                if (!flight_termination_printed) {
                    mavlink_log_critical(&mavlink_log_pub, "Geofence violation: flight termination");
                    flight_termination_printed = true;
                }
    
                if (counter % (1000000 / COMMANDER_MONITORING_INTERVAL) == 0) {
                    mavlink_log_critical(&mavlink_log_pub, "Flight termination active");
                }
            }
    
            // RC 입력 신호 체크
            if (!status_flags.rc_input_blocked && sp_man.timestamp != 0 &&
                (hrt_elapsed_time(&sp_man.timestamp) < (rc_loss_timeout * 1_s))) {
    
                /* handle the case where RC signal was regained */
                if (!status_flags.rc_signal_found_once) {
                    status_flags.rc_signal_found_once = true;
                    set_health_flags(subsystem_info_s::SUBSYSTEM_TYPE_RCRECEIVER, true, true, true && status_flags.rc_calibration_valid, status);
                    status_changed = true;
    
                } else {
                    if (status.rc_signal_lost) {
                        mavlink_log_info(&mavlink_log_pub, "MANUAL CONTROL REGAINED after %llums", hrt_elapsed_time(&rc_signal_lost_timestamp) / 1000);
                        set_health_flags(subsystem_info_s::SUBSYSTEM_TYPE_RCRECEIVER, true, true, true && status_flags.rc_calibration_valid, status);
                        status_changed = true;
                    }
                }
    
                status.rc_signal_lost = false;
    
                const bool in_armed_state = (status.arming_state == vehicle_status_s::ARMING_STATE_ARMED);
                const bool arm_switch_or_button_mapped = sp_man.arm_switch != manual_control_setpoint_s::SWITCH_POS_NONE;
                const bool arm_button_pressed = arm_switch_is_button == 1
                                && sp_man.arm_switch == manual_control_setpoint_s::SWITCH_POS_ON;
    
                /* DISARM
                 * check if left stick is in lower left position or arm button is pushed or arm switch has transition from arm to disarm
                 * and we are in MANUAL, Rattitude, or AUTO_READY mode or (ASSIST mode and landed)
                 * do it only for rotary wings in manual mode or fixed wing if landed.
                 * Disable stick-disarming if arming switch or button is mapped */
                const bool stick_in_lower_left = sp_man.r < -STICK_ON_OFF_LIMIT && sp_man.z < 0.1f
                        && !arm_switch_or_button_mapped;
                const bool arm_switch_to_disarm_transition =  arm_switch_is_button == 0 &&
                        _last_sp_man_arm_switch == manual_control_setpoint_s::SWITCH_POS_ON &&
                        sp_man.arm_switch == manual_control_setpoint_s::SWITCH_POS_OFF;
    
                if (in_armed_state &&
                    status.rc_input_mode != vehicle_status_s::RC_IN_MODE_OFF &&
                    (status.is_rotary_wing || (!status.is_rotary_wing && land_detector.landed)) &&
                    (stick_in_lower_left || arm_button_pressed || arm_switch_to_disarm_transition)) {
    
                    if (internal_state.main_state != commander_state_s::MAIN_STATE_MANUAL &&
                        internal_state.main_state != commander_state_s::MAIN_STATE_ACRO &&
                        internal_state.main_state != commander_state_s::MAIN_STATE_STAB &&
                        internal_state.main_state != commander_state_s::MAIN_STATE_RATTITUDE &&
                        !land_detector.landed) {
                        print_reject_arm("NOT DISARMING: Not in manual mode or landed yet.");
    
                    } else if ((stick_off_counter == rc_arm_hyst && stick_on_counter < rc_arm_hyst) || arm_switch_to_disarm_transition) {
                        arming_ret = arming_state_transition(&status, battery, safety, vehicle_status_s::ARMING_STATE_STANDBY, &armed,
                                             true /* fRunPreArmChecks */,
                                             &mavlink_log_pub, &status_flags, arm_requirements, hrt_elapsed_time(&commander_boot_timestamp));
                    }
    
                    stick_off_counter++;
    
                } else if (!(arm_switch_is_button == 1 && sp_man.arm_switch == manual_control_setpoint_s::SWITCH_POS_ON)) {
                    /* do not reset the counter when holding the arm button longer than needed */
                    stick_off_counter = 0;
                }
    
                /* ARM
                 * check if left stick is in lower right position or arm button is pushed or arm switch has transition from disarm to arm
                 * and we're in MANUAL mode.
                 * Disable stick-arming if arming switch or button is mapped */
                const bool stick_in_lower_right = sp_man.r > STICK_ON_OFF_LIMIT && sp_man.z < 0.1f
                        && !arm_switch_or_button_mapped;
                /* allow a grace period for re-arming: preflight checks don't need to pass during that time,
                 * for example for accidential in-air disarming */
                const bool in_arming_grace_period = last_disarmed_timestamp != 0 && hrt_elapsed_time(&last_disarmed_timestamp) < 5_s;
                const bool arm_switch_to_arm_transition = arm_switch_is_button == 0 &&
                        _last_sp_man_arm_switch == manual_control_setpoint_s::SWITCH_POS_OFF &&
                        sp_man.arm_switch == manual_control_setpoint_s::SWITCH_POS_ON &&
                        (sp_man.z < 0.1f || in_arming_grace_period);
    
                if (!in_armed_state &&
                    status.rc_input_mode != vehicle_status_s::RC_IN_MODE_OFF &&
                    (stick_in_lower_right || arm_button_pressed || arm_switch_to_arm_transition)) {
                    if ((stick_on_counter == rc_arm_hyst && stick_off_counter < rc_arm_hyst) || arm_switch_to_arm_transition) {
    
                        /* we check outside of the transition function here because the requirement
                         * for being in manual mode only applies to manual arming actions.
                         * the system can be armed in auto if armed via the GCS.
                         */
    
                        if ((internal_state.main_state != commander_state_s::MAIN_STATE_MANUAL)
                            && (internal_state.main_state != commander_state_s::MAIN_STATE_ACRO)
                            && (internal_state.main_state != commander_state_s::MAIN_STATE_STAB)
                            && (internal_state.main_state != commander_state_s::MAIN_STATE_ALTCTL)
                            && (internal_state.main_state != commander_state_s::MAIN_STATE_POSCTL)
                            && (internal_state.main_state != commander_state_s::MAIN_STATE_RATTITUDE)
                           ) {
                            print_reject_arm("NOT ARMING: Switch to a manual mode first.");
    
                        } else if (!status_flags.condition_home_position_valid &&
                               geofence_action == geofence_result_s::GF_ACTION_RTL) {
                            print_reject_arm("NOT ARMING: Geofence RTL requires valid home");
    
                        } else if (status.arming_state == vehicle_status_s::ARMING_STATE_STANDBY) {
                            arming_ret = arming_state_transition(&status, battery, safety, vehicle_status_s::ARMING_STATE_ARMED, &armed,
                                                 !in_arming_grace_period /* fRunPreArmChecks */,
                                                 &mavlink_log_pub, &status_flags, arm_requirements, hrt_elapsed_time(&commander_boot_timestamp));
    
                            if (arming_ret != TRANSITION_CHANGED) {
                                usleep(100000);
                                print_reject_arm("NOT ARMING: Preflight checks failed");
                            }
                        }
                    }
    
                    stick_on_counter++;
    
                } else if (!(arm_switch_is_button == 1 && sp_man.arm_switch == manual_control_setpoint_s::SWITCH_POS_ON)) {
                    /* do not reset the counter when holding the arm button longer than needed */
                    stick_on_counter = 0;
                }
    
                _last_sp_man_arm_switch = sp_man.arm_switch;
    
                if (arming_ret == TRANSITION_DENIED) {
                    /*
                     * the arming transition can be denied to a number of reasons:
                     *  - pre-flight check failed (sensors not ok or not calibrated)
                     *  - safety not disabled
                     *  - system not in manual mode
                     */
                    tune_negative(true);
                }
    
                /* evaluate the main state machine according to mode switches */
                bool first_rc_eval = (_last_sp_man.timestamp == 0) && (sp_man.timestamp > 0);
                transition_result_t main_res = set_main_state(status, &status_changed);
    
                /* store last position lock state */
                _last_condition_global_position_valid = status_flags.condition_global_position_valid;
    
                /* play tune on mode change only if armed, blink LED always */
                if (main_res == TRANSITION_CHANGED || first_rc_eval) {
                    tune_positive(armed.armed);
                    main_state_changed = true;
    
                } else if (main_res == TRANSITION_DENIED) {
                    /* DENIED here indicates bug in the commander */
                    mavlink_log_critical(&mavlink_log_pub, "Switching to this mode is currently not possible");
                }
    
                /* check throttle kill switch */
                if (sp_man.kill_switch == manual_control_setpoint_s::SWITCH_POS_ON) {
                    /* set lockdown flag */
                    if (!armed.manual_lockdown) {
                        mavlink_log_emergency(&mavlink_log_pub, "MANUAL KILL SWITCH ENGAGED");
                        status_changed = true;
                        armed.manual_lockdown = true;
                    }
    
                } else if (sp_man.kill_switch == manual_control_setpoint_s::SWITCH_POS_OFF) {
                    if (armed.manual_lockdown) {
                        mavlink_log_emergency(&mavlink_log_pub, "MANUAL KILL SWITCH OFF");
                        status_changed = true;
                        armed.manual_lockdown = false;
                    }
                }
    
                /* no else case: do not change lockdown flag in unconfigured case */
    
            } else {
                if (!status_flags.rc_input_blocked && !status.rc_signal_lost) {
                    mavlink_log_critical(&mavlink_log_pub, "MANUAL CONTROL LOST (at t=%llums)", hrt_absolute_time() / 1000);
                    status.rc_signal_lost = true;
                    rc_signal_lost_timestamp = sp_man.timestamp;
                    set_health_flags(subsystem_info_s::SUBSYSTEM_TYPE_RCRECEIVER, true, true, false, status);
                    status_changed = true;
                }
            }
    
            // 데이터 링크(텔레메트리) 체크
            data_link_checks(highlatencydatalink_loss_timeout, highlatencydatalink_regain_timeout, datalink_loss_timeout, datalink_regain_timeout, &status_changed);
    
            // engine failure detection
            // TODO: move out of commander
            orb_check(actuator_controls_sub, &updated);
    
            if (updated) {
                /* Check engine failure
                 * only for fixed wing for now
                 */
                if (!status_flags.circuit_breaker_engaged_enginefailure_check &&
                    !status.is_rotary_wing && !status.is_vtol && armed.armed) {
    
                    actuator_controls_s actuator_controls = {};
                    orb_copy(ORB_ID_VEHICLE_ATTITUDE_CONTROLS, actuator_controls_sub, &actuator_controls);
    
                    const float throttle = actuator_controls.control[actuator_controls_s::INDEX_THROTTLE];
                    const float current2throttle = battery.current_a / throttle;
    
                    if (((throttle > ef_throttle_thres) && (current2throttle < ef_current2throttle_thres))
                        || status.engine_failure) {
    
                        const float elapsed = hrt_elapsed_time(&timestamp_engine_healthy) / 1e6f;
    
                        /* potential failure, measure time */
                        if ((timestamp_engine_healthy > 0) && (elapsed > ef_time_thres)
                            && !status.engine_failure) {
    
                            status.engine_failure = true;
                            status_changed = true;
    
                            PX4_ERR("Engine Failure");
                            set_health_flags(subsystem_info_s::SUBSYSTEM_TYPE_MOTORCONTROL, true, true, false, status);
                        }
                    }
    
                } else {
                    /* no failure reset flag */
                    timestamp_engine_healthy = hrt_absolute_time();
    
                    if (status.engine_failure) {
                        status.engine_failure = false;
                        status_changed = true;
                    }
                }
            }
    
            /* Reset main state to loiter or auto-mission after takeoff is completed.
             * Sometimes, the mission result topic is outdated and the mission is still signaled
             * as finished even though we only just started with the takeoff. Therefore, we also
             * check the timestamp of the mission_result topic. */
            if (internal_state.main_state == commander_state_s::MAIN_STATE_AUTO_TAKEOFF
                && (_mission_result_sub.get().timestamp > internal_state.timestamp)
                && _mission_result_sub.get().finished) {
    
                const bool mission_available = (_mission_result_sub.get().timestamp > commander_boot_timestamp)
                                   && (_mission_result_sub.get().instance_count > 0) && _mission_result_sub.get().valid;
    
                if ((takeoff_complete_act == 1) && mission_available) {
                    main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_MISSION, status_flags, &internal_state);
    
                } else {
                    main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_LOITER, status_flags, &internal_state);
                }
            }
    
            /* check if we are disarmed and there is a better mode to wait in */
            if (!armed.armed) {
    
                /* if there is no radio control but GPS lock the user might want to fly using
                 * just a tablet. Since the RC will force its mode switch setting on connecting
                 * we can as well just wait in a hold mode which enables tablet control.
                 */
                if (status.rc_signal_lost && (internal_state.main_state == commander_state_s::MAIN_STATE_MANUAL)
                    && status_flags.condition_home_position_valid) {
    
                    main_state_transition(status, commander_state_s::MAIN_STATE_AUTO_LOITER, status_flags, &internal_state);
                }
            }
    
            /* handle commands last, as the system needs to be updated to handle them */
            orb_check(cmd_sub, &updated);
    
            if (updated) {
                struct vehicle_command_s cmd;
    
                /* got command */
                orb_copy(ORB_ID(vehicle_command), cmd_sub, &cmd);
    
                /* handle it */
                if (handle_command(&status, cmd, &armed, &_home, &home_pub, &command_ack_pub, &status_changed)) {
                    status_changed = true;
                }
            }
    
            /* Check for failure combinations which lead to flight termination */
            if (armed.armed &&
                !status_flags.circuit_breaker_flight_termination_disabled) {
                /* At this point the data link and the gps system have been checked
                 * If we are not in a manual (RC stick controlled mode)
                 * and both failed we want to terminate the flight */
                if (internal_state.main_state != commander_state_s::MAIN_STATE_MANUAL &&
                    internal_state.main_state != commander_state_s::MAIN_STATE_ACRO &&
                    internal_state.main_state != commander_state_s::MAIN_STATE_RATTITUDE &&
                    internal_state.main_state != commander_state_s::MAIN_STATE_STAB &&
                    internal_state.main_state != commander_state_s::MAIN_STATE_ALTCTL &&
                    internal_state.main_state != commander_state_s::MAIN_STATE_POSCTL &&
                    status.data_link_lost) {
    
                    armed.force_failsafe = true;
                    status_changed = true;
                    static bool flight_termination_printed = false;
    
                    if (!flight_termination_printed) {
                        mavlink_log_critical(&mavlink_log_pub, "DL and GPS lost: flight termination");
                        flight_termination_printed = true;
                    }
    
                    if (counter % (1000000 / COMMANDER_MONITORING_INTERVAL) == 0) {
                        mavlink_log_critical(&mavlink_log_pub, "DL and GPS lost: flight termination");
                    }
                }
    
                /* At this point the rc signal and the gps system have been checked
                 * If we are in manual (controlled with RC):
                 * if both failed we want to terminate the flight */
                if ((internal_state.main_state == commander_state_s::MAIN_STATE_ACRO ||
                     internal_state.main_state == commander_state_s::MAIN_STATE_RATTITUDE ||
                     internal_state.main_state == commander_state_s::MAIN_STATE_MANUAL ||
                     internal_state.main_state == commander_state_s::MAIN_STATE_STAB ||
                     internal_state.main_state == commander_state_s::MAIN_STATE_ALTCTL ||
                     internal_state.main_state == commander_state_s::MAIN_STATE_POSCTL) &&
                    status.rc_signal_lost) {
    
                    armed.force_failsafe = true;
                    status_changed = true;
                    static bool flight_termination_printed = false;
    
                    if (!flight_termination_printed) {
                        warnx("Flight termination because of RC signal loss and GPS failure");
                        flight_termination_printed = true;
                    }
    
                    if (counter % (1000000 / COMMANDER_MONITORING_INTERVAL) == 0) {
                        mavlink_log_critical(&mavlink_log_pub, "RC and GPS lost: flight termination");
                    }
                }
            }
    
            /* Get current timestamp */
            const hrt_abstime now = hrt_absolute_time();
    
            // 홈 위치 자동 지정
            // automatically set or update home position
            if (!_home.manual_home) {
                const vehicle_local_position_s &local_position = _local_position_sub.get();
    
                if (armed.armed) {
                    if ((!was_armed || (was_landed && !land_detector.landed)) &&
                        (hrt_elapsed_time(&commander_boot_timestamp) > INAIR_RESTART_HOLDOFF_INTERVAL)) {
    
                        /* update home position on arming if at least 500 ms from commander start spent to avoid setting home on in-air restart */
                        set_home_position(home_pub, _home, false);
                    }
    
                } else {
                    if (status_flags.condition_home_position_valid) {
                        if (land_detector.landed && local_position.xy_valid && local_position.z_valid) {
                            /* distance from home */
                            float home_dist_xy = -1.0f;
                            float home_dist_z = -1.0f;
                            mavlink_wpm_distance_to_point_local(_home.x, _home.y, _home.z,
                                                local_position.x, local_position.y, local_position.z,
                                                &home_dist_xy, &home_dist_z);
    
                            if ((home_dist_xy > local_position.eph * 2) || (home_dist_z > local_position.epv * 2)) {
    
                                /* update when disarmed, landed and moved away from current home position */
                                set_home_position(home_pub, _home, false);
                            }
                        }
    
                    } else {
                        /* First time home position update - but only if disarmed */
                        set_home_position(home_pub, _home, false);
                    }
                }
    
                /* Set home position altitude to EKF origin height if home is not set and the EKF has a global origin.
                 * This allows home atitude to be used in the calculation of height above takeoff location when GPS
                 * use has commenced after takeoff. */
                if (!_home.valid_alt && local_position.z_global) {
                    set_home_position(home_pub, _home, true);
    
                }
            }
    
            // check for arming state change
            if (was_armed != armed.armed) {
                status_changed = true;
    
                if (!armed.armed) { // increase the flight uuid upon disarming
                    ++flight_uuid;
                    // no need for param notification: the only user is mavlink which reads the param upon request
                    param_set_no_notification(_param_flight_uuid, &flight_uuid);
                    last_disarmed_timestamp = hrt_absolute_time();
                }
            }
    
            was_armed = armed.armed;
    
            // 기체 상태 또는 failsafe 상태에 따라 navigation 상태 바꾸기
            /* now set navigation state according to failsafe and main state */
            bool nav_state_changed = set_nav_state(&status,
                                   &armed,
                                   &internal_state,
                                   &mavlink_log_pub,
                                   (link_loss_actions_t)datalink_loss_act,
                                   _mission_result_sub.get().finished,
                                   _mission_result_sub.get().stay_in_failsafe,
                                   status_flags,
                                   land_detector.landed,
                                   (link_loss_actions_t)rc_loss_act,
                                   offboard_loss_act,
                                   offboard_loss_rc_act,
                                   posctl_nav_loss_act);
    
            if (status.failsafe != failsafe_old) {
                status_changed = true;
    
                if (status.failsafe) {
                    mavlink_log_info(&mavlink_log_pub, "Failsafe mode enabled");
    
                } else {
                    mavlink_log_info(&mavlink_log_pub, "Failsafe mode disabled");
                }
    
                failsafe_old = status.failsafe;
            }
    
            // TODO handle mode changes by commands
            if (main_state_changed || nav_state_changed) {
                status_changed = true;
                main_state_changed = false;
            }
    
            // 기체 상태 출판(publish)
            /* publish states (armed, control_mode, vehicle_status, commander_state, vehicle_status_flags) at 1 Hz or immediately when changed */
            if (hrt_elapsed_time(&status.timestamp) >= 1_s || status_changed) {
    
                set_control_mode();
                control_mode.timestamp = now;
                orb_publish(ORB_ID(vehicle_control_mode), control_mode_pub, &control_mode);
    
                status.timestamp = now;
                orb_publish(ORB_ID(vehicle_status), status_pub, &status);
    
                armed.timestamp = now;
    
                /* set prearmed state if safety is off, or safety is not present and 5 seconds passed */
                if (safety.safety_switch_available) {
    
                    /* safety is off, go into prearmed */
                    armed.prearmed = safety.safety_off;
    
                } else {
                    /* safety is not present, go into prearmed
                     * (all output drivers should be started / unlocked last in the boot process
                     * when the rest of the system is fully initialized)
                     */
                    armed.prearmed = (hrt_elapsed_time(&commander_boot_timestamp) > 5_s);
                }
    
                orb_publish(ORB_ID(actuator_armed), armed_pub, &armed);
    
                /* publish internal state for logging purposes */
                if (commander_state_pub != nullptr) {
                    orb_publish(ORB_ID(commander_state), commander_state_pub, &internal_state);
    
                } else {
                    commander_state_pub = orb_advertise(ORB_ID(commander_state), &internal_state);
                }
    
                /* publish vehicle_status_flags */
                status_flags.timestamp = hrt_absolute_time();
    
                if (vehicle_status_flags_pub != nullptr) {
                    orb_publish(ORB_ID(vehicle_status_flags), vehicle_status_flags_pub, &status_flags);
    
                } else {
                    vehicle_status_flags_pub = orb_advertise(ORB_ID(vehicle_status_flags), &status_flags);
                }
            }
    
            // arming 일어날떄 소리내고, 배터리 경고시 소리내기
            /* play arming and battery warning tunes */
            if (!arm_tune_played && armed.armed && (!safety.safety_switch_available || (safety.safety_switch_available
                                && safety.safety_off))) {
                /* play tune when armed */
                set_tune(TONE_ARMING_WARNING_TUNE);
                arm_tune_played = true;
    
            } else if (!status_flags.usb_connected &&
                   (status.hil_state != vehicle_status_s::HIL_STATE_ON) &&
                   (battery.warning == battery_status_s::BATTERY_WARNING_CRITICAL)) {
                /* play tune on battery critical */
                set_tune(TONE_BATTERY_WARNING_FAST_TUNE);
    
            } else if ((status.hil_state != vehicle_status_s::HIL_STATE_ON) &&
                   (battery.warning == battery_status_s::BATTERY_WARNING_LOW)) {
                /* play tune on battery warning */
                set_tune(TONE_BATTERY_WARNING_SLOW_TUNE);
    
            } else if (status.failsafe) {
                tune_failsafe(true);
    
            } else {
                set_tune(TONE_STOP_TUNE);
            }
    
            /* reset arm_tune_played when disarmed */
            if (!armed.armed || (safety.safety_switch_available && !safety.safety_off)) {
    
                //Notify the user that it is safe to approach the vehicle
                if (arm_tune_played) {
                    tune_neutral(true);
                }
    
                arm_tune_played = false;
            }
    
            /* play sensor failure tunes if we already waited for hotplug sensors to come up and failed */
            status_flags.condition_system_hotplug_timeout = (hrt_elapsed_time(&commander_boot_timestamp) > HOTPLUG_SENS_TIMEOUT);
    
            if (!sensor_fail_tune_played && (!status_flags.condition_system_sensors_initialized
                             && status_flags.condition_system_hotplug_timeout)) {
                set_tune_override(TONE_GPS_WARNING_TUNE);
                sensor_fail_tune_played = true;
                status_changed = true;
            }
    
            counter++;
    
            int blink_state = blink_msg_state();
    
            if (blink_state > 0) {
                /* blinking LED message, don't touch LEDs */
                if (blink_state == 2) {
                    /* blinking LED message completed, restore normal state */
                    control_status_leds(&status, &armed, true, &battery, &cpuload);
                }
    
            } else {
                /* normal state */
                control_status_leds(&status, &armed, status_changed, &battery, &cpuload);
            }
    
            status_changed = false;
    
            if (!armed.armed) {
                /* Reset the flag if disarmed. */
                have_taken_off_since_arming = false;
            }
    
            arm_auth_update(now, params_updated || param_init_forced);
    
            // Handle shutdown request from emergency battery action
            if(!armed.armed && dangerous_battery_level_requests_poweroff){
                mavlink_log_critical(&mavlink_log_pub, "DANGEROUSLY LOW BATTERY, SHUT SYSTEM DOWN");
                usleep(200000);
                int ret_val = px4_shutdown_request(false, false);
    
                if (ret_val) {
                    mavlink_log_critical(&mavlink_log_pub, "SYSTEM DOES NOT SUPPORT SHUTDOWN");
                    dangerous_battery_level_requests_poweroff = false;
    
                } else {
                    while (1) { usleep(1); }
                }
            }
    
            usleep(COMMANDER_MONITORING_INTERVAL);
        }
    
        thread_should_exit = true;
    
        /* wait for threads to complete */
        int ret = pthread_join(commander_low_prio_thread, nullptr);
    
        if (ret) {
            warn("join failed: %d", ret);
        }
    
        rgbled_set_color_and_mode(led_control_s::COLOR_WHITE, led_control_s::MODE_OFF);
    
        /* close fds */
        led_deinit();
        buzzer_deinit();
        px4_close(sp_man_sub);
        px4_close(offboard_control_mode_sub);
        px4_close(safety_sub);
        px4_close(cmd_sub);
        px4_close(subsys_sub);
        px4_close(param_changed_sub);
        px4_close(battery_sub);
        px4_close(land_detector_sub);
        px4_close(estimator_status_sub);
    
        thread_running = false;
    }

