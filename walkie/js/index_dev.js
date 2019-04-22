$(document).ready(function () {
    var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
    $(window).resize(function () {

        $('#messages_list').css('bottom', $('#message_body').height() + 16);
        $('#messages_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
        $('#rooms_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
        console.log($('.mdc-toolbar').outerHeight());
    });

    if ($(document.body).width() > 500) {
        $('.body_').css('width', $(document.body).width() * 0.7);
        $('.body_').css('border', '1px dashed rgba(0,0,0,.54)');
        $('.body_').css('border-radius', '12px');
        $('.body_').css('bottom', '2px');
        console.log('jo')
    }
    $('#messages_list').css('bottom', $('#message_body').height() + 16);
    $('#messages_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
    $('#rooms_list').css('top', $('.mdc-toolbar').outerHeight() + 4);
    mdc.textField.MDCTextField.attachTo(document.querySelector('.mdc-text-field'));
    [].forEach.call(document.querySelectorAll('.mdc-tab-bar'), function (el) {
        mdc.tabBar.MDCTabBar.attachTo(el);
    });


    var selector = '.mdc-button, .mdc-icon-button, .mdc-card__primary-action';
    [].map.call(document.querySelectorAll(selector), function (el) {
        mdc.ripple.MDCRipple.attachTo(el);
    });

    [].forEach.call(document.querySelectorAll('.mdc-linear-progress'), function (el) {
        mdc.linearProgress.MDCLinearProgress.attachTo(el);
    });
    mdc.textField.MDCTextField.attachTo(document.querySelector('.mdc-text-field'));

    $("#demo01").animatedModal({color: '#fff', animatedIn: 'fadeIn', animationDuration: '.6s'});
    $('#demo01').click(function () {
        $('#messages_chat_room').addClass('mess_chat_room_show');
        console.log('kuku')
    });
    $('.close-animatedModal').click(function () {
        $('#messages_chat_room').removeClass('mess_chat_room_show');
    });

    /**
     * Инициализация слушателя
     */





    window.app_power = false;
    $('#app_power').click(function () {
        if (window.app_power) {
            window.app_power = false;
            $('#app_power_icon').removeClass('icon-animated-form');
            window.morseListner.stop();
        } else {
            window.app_power = true;
            $('#app_power_icon').addClass('icon-animated-form');
            var typingListner = null;
            window.another_user_message_string = '';
            var messageCallback = function (data) {
                window.another_user_message_string += data.message;
                if (typingListner) {
                    clearTimeout(typingListner);
                } else {
                    $('.typing-indicator').css('opacity',1);
                }
                typingListner = setTimeout(function () {
                    $('.typing-indicator').css('opacity',0);
                    $('#messages_list').append(`<div class="mdc-card-object">
                    <div class="mdc-card line-another-user">
                        <div class="mdc-card-content mdc-typography--body2">${window.another_user_message_string}</div>
                    </div>
                    <div class="mdc-card-spacer"></div>


                </div>`);
                    window.another_user_message_string = '';
                }, 1000);

                console.log('work');
                console.log("Decoded: {\n  timings: " + data.timings + "\n  morse: " + data.morse + "\n  message: " + data.message + "\n}");
            }
            var decoder = new MorseDecoder(45, 40);
            decoder.speedCallback = function () {
                console.log('time to tell speed');
            };

            //осле последнего колбека считаем сообщение завершенным если не будет какого-то спама через 500 милисекунд
            decoder.speedCallbackRateLimiter = 1;
            decoder.lockSpeed = true;
            decoder.messageCallback = messageCallback;
            console.log(decoder.fwpm);
            window.morseListner = new MorseListener(256,-60,-30,530,580,200);

            window.morseListner.decoder = decoder;
            window.morseListner.micSuccessCallback = function () {
                console.log('connected mic');
            };

            window.morseListner.startListening();
            window.morseListner.processSound();
        }
    });


    //три режима. 1 - обычный наиболее медленный, надеждный. (просто передача текста через строку) 2 - этот метод передаёт слова, как цифры. 3 - этот метод исопльзует буквы ? 4 - спец метод шиврования ??? черезз циырф 5 - метод через музыку ? 6. акцент не на биты а на цифры и качество сигнала 7.Транслировать оригинал.

//трансляция оригинала и команд, в формате текста. русский буквы - декодировать в английские.

    //через стак меыыфпу и пустату.


    /**
     * Инициализация преобразователя
     *
     * */



    var bitwise = require('bitwise');
    var bytes = require('utf8-bytes');


    window.messages = 0;
    $('#message_send').click(function () {
        sendMessage();
    });
    function sendMessage(){
        console.log($('#tf-outlined-message-input').val());
        if ($('#tf-outlined-message-input').val()) {
            var object = {};
            object.m = $('#tf-outlined-message-input').val();
            var data_b = bytes(JSON.stringify(object));
            var data_s = [];

            for (var i = 0; i < data_b.length; i++) {

                data_s = data_s.concat(bitwise.byte.read(data_b[i]));
                //data_s.push(-1)
            }
            console.log(object);
            console.log(JSON.stringify(object));
            console.log(data_b);
            console.log(data_s);
            var end_ = object.m;


            /*
            console.log($('#tf-outlined-message-input').val());
            var object = {};
            object.m = $('#tf-outlined-message-input').val();
            var data_b = bytes(JSON.stringify(object));
            var data_s = [];

            for(var i = 0 ; i < data_b.length; i++){

                data_s = data_s.concat(bitwise.byte.read(data_b[i]));
                //data_s.push(-1)
            }
            console.log(object);
            console.log(JSON.stringify(object));
            console.log(data_b);
            console.log(data_s);
            var end_ = data_s.join('');
            end_ = end_.replace(/0/g, "e");
            end_ = end_.replace(/1/g, "t");
            console.log(end_);
*/

            /*
            console.log($('#tf-outlined-message-input').val());
            var object = {};
            object.m = $('#tf-outlined-message-input').val();
            var data_b = bytes(JSON.stringify(object));
            var data_s = [];

            for(var i = 0 ; i < data_b.length; i++){

                data_s = data_s.concat(bitwise.byte.read(data_b[i]));
                //data_s.push(-1)
            }
            console.log(object);
            console.log(JSON.stringify(object));
            console.log(data_b);
            var specl = data_s.join('');
            specl =specl.replace(/0/g, "e");
            specl = specl.replace(/1/g, "t");
            console.log(specl);
            var end_ = data_b.join();
            //ожно попробовать заменить на ускореный режим.
            end_ = end_.replace(/0/g, "e");
            end_ = end_.replace(/8/g, "t");
            end_ = end_.replace(/3/g, "n");
            console.log(end_);
*/

            //var MorseCWWave =require( './data-transferer/morse-pro-cw-wave').default;
            //var MorsePlayerWAA = require( './data-transferer/morse-pro-player-waa').default;
            //var MorseListener = require ('./data-transferer/morse-pro-listener').default;
            //var MorseDecoder = require('./data-transferer/morse-pro-decoder').default;

            //var MorseCW = require('./data-transferer/morse-pro-cw').default;


            $('#messages_list').append(`<div  class="mdc-card-object">
                    <div class="mdc-card-spacer"></div>
                    <div class="mdc-card line-current-user ">
                        <div class="mdc-card-content mdc-typography--body2">${object.m}


                            </div>
                        <div id="${"specM" + window.messages}" role="progressbar" class=" mdc-linear-progress-trans mdc-linear-progress mdc-linear-progress--indeterminate">
                            <div class="mdc-linear-progress__buffering-dots"></div>
                            <div class="mdc-linear-progress__buffer"></div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
                                <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                            <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
                                <span class="mdc-linear-progress__bar-inner"></span>
                            </div>
                        </div>
                    </div>
                </div>`);

//С новым годом!

            var morseCW = new MorseCW(true, 45, 50);
            morseCW.translate(end_);
            var timings = morseCW.getDuration();
            //console.log(timings);
            var morseCWWave = new MorseCWWave(true, 45, 40);

            morseCWWave.translate(end_);
            console.log(morseCWWave.timings);
            var morsePlayerWAA = new MorsePlayerWAA();
            //

            morsePlayerWAA.loadCWWave(morseCWWave);
            morsePlayerWAA.playFromStart();
            //console.log('work');
            $('#message_body').addClass('mdc-text-field--disabled');
            $('#tf-outlined-message-input').val('');
            $('#tf-outlined-message-input').blur();

            setTimeout(function () {
                $('#specM' + window.messages).css('height', '0px');
                setTimeout(function () {
                    $('#specM' + window.messages).remove();
                    window.messages += 1;
                    $('#message_body').removeClass('mdc-text-field--disabled');
                    //clearInterval(endListner);
                }, 500);
            }, timings + 500);

        }
        }
    $('#tf-outlined-message-input').keypress(function (e) {
        if (e.keyCode === 13) {



            sendMessage();
        }

    });

});