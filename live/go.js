var client = AgoraRTC.createClient({
    mode: 'live',
    codec: 'vp8'
});


var mainStreamId;
var cameraVideoProfile = '720p_6';
var localStreams = {
    uid: '',
    camera: {
        camId: '',
        micId: '',
        stream: {}
    }
};


var devices = {
    cameras: [],
    mics: []
}


function initClientAndJoinChannel(agoraAppId, channelName) {
    client.init(agoraAppId, function() {
        joinChannel(channelName);
    }, function(err) {});
}


client.on('stream-added', function(evt) {
    var stream = evt.stream;
    client.subscribe(stream, function(err) {});
});


client.on('stream-subscribed', function(evt) {
    var remoteStream = evt.stream;
    var remoteId = remoteStream.getId();
    console.log("Subscribe remote stream successfully: " + remoteId);
    if ($('#full-screen-video').is(':empty')) {
        mainStreamId = remoteId;
        remoteStream.play('full-screen-video');
    } else {
        addRemoteStreamMiniView(remoteStream);
    }
});


client.on('stream-removed', function(evt) {
    var stream = evt.stream;
    stream.stop();
    stream.close();
});


function joinChannel(channelName) {
    disableChannelBtn();
    var token = generateToken();
    var userID = null;
    client.setClientRole('host', function() {}, function(e) {});
    client.join(token, channelName, userID, function(uid) {
        createCameraStream(uid, {});
        localStreams.uid = uid;
    }, function(err) {});
}


function createCameraStream(uid, deviceIds) {
    var localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false
    });
    localStream.setVideoProfile(cameraVideoProfile);
    localStream.on("accessAllowed", function() {
        if (devices.cameras.length === 0 && devices.mics.length === 0) {
            getCameraDevices();
            getMicDevices();
        }
    });
    localStream.init(function() {
        localStream.play('full-screen-video');
        if ($.isEmptyObject(localStreams.camera.stream)) {
            enableUiControls(localStream);
        } else {
            $("#mic-btn").prop("disabled", false);
            $("#video-btn").prop("disabled", false);
            $("#exit-btn").prop("disabled", false);
            $("#mic-dropdown").prop("disabled", false);
            $("#cam-dropdown").prop("disabled", false);
        }
        client.publish(localStream, function(err) {});
        localStreams.camera.stream = localStream;
    }, function(err) {});
}
function leaveChannel() {
    enableChannelBtn();
    client.leave(function() {
        localStreams.camera.stream.stop()
        localStreams.camera.stream.close();
        client.unpublish(localStreams.camera.stream);
        $('#mic-btn').prop('disabled', true);
        $('#video-btn').prop('disabled', true);
        $('#exit-btn').prop('disabled', true);
        $("#mic-dropdown").prop("disabled", true);
        $("#cam-dropdown").prop("disabled", true);
    }, function(err) {});
}


function generateToken() {
    return null;
}


function changeStreamSource(deviceIndex, deviceType) {
    console.log('Switching stream sources for: ' + deviceType);
    var deviceId;
    var existingStream = false;
    if (deviceType === "video") {
        deviceId = devices.cameras[deviceIndex].deviceId
    }
    if (deviceType === "audio") {
        deviceId = devices.mics[deviceIndex].deviceId;
    }
    localStreams.camera.stream.switchDevice(deviceType, deviceId, function() {
        console.log('successfully switched to new device with id: ' + JSON.stringify(deviceId));
        if (deviceType === "audio") {
            localStreams.camera.micId = deviceId;
        } else if (deviceType === "video") {
            localStreams.camera.camId = deviceId;
        } else {
            console.log("unable to determine deviceType: " + deviceType);
        }
    }, function() {
        console.log('failed to switch to new device with id: ' + JSON.stringify(deviceId));
    });
}


function getCameraDevices() {
    client.getCameras(function(cameras) {
        devices.cameras = cameras;
        cameras.forEach(function(camera, i) {
            var name = camera.label.split('(')[0];
            var optionId = 'camera_' + i;
            var deviceId = camera.deviceId;
            if (i === 0 && localStreams.camera.camId === '') {
                localStreams.camera.camId = deviceId;
            }
            $('#camera-list').append('<a class="dropdown-item" id="' + optionId + '">' + name + '</a>');
        });
        $('#camera-list a').click(function(event) {
            var index = event.target.id.split('_')[1];
            changeStreamSource(index, "video");
        });
    });
}


function getMicDevices() {
    client.getRecordingDevices(function(mics) {
        devices.mics = mics;
        mics.forEach(function(mic, i) {
            var name = mic.label.split('(')[0];
            var optionId = 'mic_' + i;
            var deviceId = mic.deviceId;
            if (i === 0 && localStreams.camera.micId === '') {
                localStreams.camera.micId = deviceId;
            }
            if (name.split('Default - ')[1] != undefined) {
                name = '[Default Device]'
            }
            $('#mic-list').append('<a class="dropdown-item" id="' + optionId + '">' + name + '</a>');
        });
        $('#mic-list a').click(function(event) {
            var index = event.target.id.split('_')[1];
            changeStreamSource(index, "audio");
        });
    });
}


$(document).ready(function() {
    $("#modalForm").modal("show");
});


$("#join-channel").click(function(event) {
    var agoraAppId = "a6af85f840ef43108491705e2315a857";
    var channelName = $('#form-channel').val();
    initClientAndJoinChannel(agoraAppId, channelName);
    $("#modalForm").modal("hide");
});


$(document).keypress(function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        $("#join-channel").trigger('click');
    }
});


function enableUiControls() {
    $("#mic-btn").prop("disabled", false);
    $("#video-btn").prop("disabled", false);
    $("#exit-btn").prop("disabled", false);
    $("#cam-dropdown").prop("disabled", false);
    $("#mic-dropdown").prop("disabled", false);
    $("#mic-btn").click(function() {
        toggleMic();
    });
    $("#video-btn").click(function() {
        toggleVideo();
    });
    $("#exit-btn").click(function() {
        $('.toast').toast('show');
        setTimeout(leaveChannel(), 900000)
        $("#modalForm").modal("show");
    });
    $(document).keypress(function(e) {
        switch (e.key) {
        case "m":
            toggleMic();
            break;
        case "v":
            toggleVideo();
            break;
        case "q":
            $('.toast').toast('show');
            setTimeout(leaveChannel(), 900000)
            $("#modalForm").modal("show");
            break;
        default:
        }
    });
}


function toggleMic() {
    $("#mic-icon").toggleClass('fa-microphone').toggleClass('fa-microphone-slash');
    if ($("#mic-icon").hasClass('fa-microphone')) {
        localStreams.camera.stream.unmuteAudio();
    } else {
        localStreams.camera.stream.muteAudio();
    }
}


function toggleVideo() {
    if ($("#video-icon").hasClass('fa-video')) {
        localStreams.camera.stream.muteVideo();
        console.log("muteVideo");
    } else {
        localStreams.camera.stream.unmuteVideo();
        console.log("unMuteVideo");
    }
    $("#video-icon").toggleClass('fa-video').toggleClass('fa-video-slash');
}


function disableChannelBtn() {
    $('#join-channel').attr('disabled', true);
    $('#form-channel').attr('disabled', true);
    $("#join-channel").html("Channel Already Chosen");
}


function enableChannelBtn() {
    $('#join-channel').attr('disabled', false);
    $('#form-channel').attr('disabled', false);
    $("#join-channel").html("Join Channel");
}


$("#mic-btn").prop("disabled", true);
$("#video-btn").prop("disabled", true);
$("#exit-btn").prop("disabled", true);
$("#cam-dropdown").prop("disabled", true);
$("#mic-dropdown").prop("disabled", true);
$(function() {
    var loader = function() {
        setTimeout(function() {
            if ($('#loader').length > 0) {
                $('#loader').removeClass('show');
            }
        }, 1000);
    };
    loader();
});


console.clear();
