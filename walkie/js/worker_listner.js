var typingListner = null;
var another_user_message_string = '';
var messageCallback = function (data) {
    another_user_message_string += data.message;
    if (typingListner) {
        clearTimeout(typingListner);
    } else {
        postMessage({operation_type:1,typing:true});
        //$('.typing-indicator').css('opacity',1);
    }
    typingListner = setTimeout(function () {
        postMessage({operation_type:1,typing:false});
        postMessage({operation_type:2,message:another_user_message_string});
        //$('.typing-indicator').css('opacity',0);
        /*
        $('#messages_list').append(`<div class="mdc-card-object">
                    <div class="mdc-card line-another-user">
                        <div class="mdc-card-content mdc-typography--body2">${another_user_message_string}</div>
                    </div>
                    <div class="mdc-card-spacer"></div>


                </div>`);
                */
        another_user_message_string = '';
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
var morseListner = new MorseListener(256);
morseListner.decoder = decoder;
morseListner.micSuccessCallback = function () {
    console.log('connected mic');
};

morseListner.startListening();
morseListner.processSound();