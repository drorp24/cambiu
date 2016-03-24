function isUploadSupported() {
    if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
        return false;
    }
    var elem = document.createElement('input');
    elem.type = 'file';
    return !elem.disabled;
};

function listen_to_file_input() {
    if (window.File && window.FileReader && window.FormData) {
        var $inputField = $('#order_photo');

        $inputField.on('change', function (e) {
            console.log('$inputField has just changed');
            var file = e.target.files[0];

            if (file) {
                if (/^image\//i.test(file.type)) {
                    readFile(file);
                } else {
                    alert('Not a valid image!');
                }
            }
        });
    } else {
        alert("File upload is not supported!");
    }
}

function readFile(file) {
    console.log('readFile');
    var reader = new FileReader();

    reader.onloadend = function () {
        processFile(reader.result, file.type);
    }

    reader.onerror = function () {
        alert('There was an error reading the file!');
    }

    reader.readAsDataURL(file);
}

function processFile(dataURL, fileType) {
    console.log('processFile');
    var maxWidth = 800;
    var maxHeight = 800;

    var image = new Image();
    image.src = dataURL;

    image.onload = function () {
        var width = image.width;
        var height = image.height;
        var shouldResize = (width > maxWidth) || (height > maxHeight);

        if (!shouldResize) {
            sendFile(dataURL);
            return;
        }

        var newWidth;
        var newHeight;

        if (width > height) {
            newHeight = height * (maxWidth / width);
            newWidth = maxWidth;
        } else {
            newWidth = width * (maxHeight / height);
            newHeight = maxHeight;
        }

        var canvas = document.createElement('canvas');

        canvas.width = newWidth;
        canvas.height = newHeight;

        var context = canvas.getContext('2d');

        context.drawImage(this, 0, 0, newWidth, newHeight);

        dataURL = canvas.toDataURL(fileType);

        sendFile(dataURL);
    };

    image.onerror = function () {
        alert('There was an error processing your file!');
    };
}

function sendFile(fileData) {
    console.log('sendFile');
    var formData = new FormData();

    formData.append('imageData', fileData);

    $.ajax({
        type: 'POST',
        url: '/orders/upload',
        data: formData,
        dataType: "JSON",
        contentType: false,
        processData: false,
        success: function (data) {
                console.log('The photo was successfully uploaded!');
        },
        error: function (data) {
            alert('There was an error uploading your file!');
        }
    });
}
